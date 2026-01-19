// app/api/redbook/route.js
import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// 初始化千帆 OpenAI 兼容客户端
const client = new OpenAI({
  apiKey: process.env.BAIDU_BEARER_TOKEN, // 千帆 Bearer Token
  baseURL: "https://qianfan.baidubce.com/v2", // 千帆固定域名
  // defaultHeaders: {
  //   appid: process.env.BAIDU_APPID, // 你的千帆 AppID（非必传，但建议加）
  // },
});

export async function POST(req) {
  try {
    // 1. 接收前端参数（风格、赛道、核心卖点）
    const { style, track, keyword } = await req.json();

    // 2. 拼接小红书文案提示词（和之前一致）
    const prompt = `
      你是小红书资深文案策划，帮我生成3条符合以下要求的小红书文案：
      1. 风格：${style}（活泼/温柔/干货/搞笑/氛围感）
      2. 赛道：${track}（美妆/穿搭/美食/家居/职场/母婴）
      3. 核心卖点：${keyword}
      要求：
      - 标题吸睛，带emoji，字数控制在15-20字
      - 正文分3-4行，口语化，有情绪，不生硬
      - 结尾带3个以上相关话题标签（比如#小红书爆款 #美妆好物）
      - 每条文案单独分行，用【1】【2】【3】标注
    `.trim();

    // 3. 调用千帆大模型（OpenAI 兼容接口，支持流式）
    const stream = await client.chat.completions.create({
      model: "ernie-4.5-turbo-32k", // 优先用3.5，免费额度多；也可用ernie-4.0-turbo-8k
      messages: [{ role: "user", content: prompt }],
      stream: true, // 开启流式输出（和OpenAI逻辑完全一致）
      temperature: 0.8, // 创意度
      max_tokens: 1000, // 最大生成字数
    });

    // 4. 处理流式响应（和你最初的OpenAI逻辑一致）
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    // 5. 返回流式响应给前端（格式和前端兼容）
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("文案生成失败：", error.message);
    return NextResponse.json(
      { error: `文案生成失败：${error.message}` },
      { status: 500 }
    );
  }
}
