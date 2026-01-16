// test-baidu-key.js
import axios from "axios";
// 加载环境变量（如果用.env.local，需先安装dotenv）
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// 从环境变量取Key（也可以直接手动填，测试完删掉）
const BAIDU_API_KEY = process.env.BAIDU_API_KEY;
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY;

/**
 * 测试获取百度access_token
 * 返回true=Key有效，false=Key无效
 */
async function testBaiduKey() {
  console.log("=== 开始验证百度Key ===");
  console.log("当前API Key：", BAIDU_API_KEY ? "已配置" : "未配置");
  console.log("当前Secret Key：", BAIDU_SECRET_KEY ? "已配置" : "未配置");

  // 1. 先检查Key是否填写
  if (!BAIDU_API_KEY || !BAIDU_SECRET_KEY) {
    console.error("❌ 错误：API Key或Secret Key未配置！");
    return false;
  }

  try {
    // 2. 调用百度鉴权接口获取Token
    const response = await axios.post(
      "https://aip.baidubce.com/oauth/2.0/token",
      null,
      {
        params: {
          grant_type: "client_credentials",
          client_id: BAIDU_API_KEY,
          client_secret: BAIDU_SECRET_KEY,
        },
        timeout: 10000, // 超时10秒
      }
    );

    // 3. 解析返回结果
    const data = response.data;
    if (data.access_token) {
      console.log("✅ Key有效！获取Token成功：");
      console.log("   - Token：", data.access_token.substring(0, 20) + "***"); // 隐藏部分字符，避免泄露
      console.log("   - 有效期：", data.expires_in / 3600, "小时（约30天）");
      return true;
    } else {
      console.error("❌ Key无效！返回结果无Token：", data);
      return false;
    }
  } catch (error) {
    console.error("❌ 获取Token失败！错误详情：");
    // 分情况提示错误原因（新手友好）
    if (error.response) {
      // 百度返回明确错误码
      const errData = error.response.data;
      switch (errData.error) {
        case "invalid_client":
          console.log("   → 原因：API Key或Secret Key填写错误，或应用已被删除");
          break;
        case "unauthorized_client":
          console.log("   → 原因：应用未开通文心一言服务，或账号无权限");
          break;
        default:
          console.log("   → 百度返回错误：", errData);
      }
    } else if (error.request) {
      console.log("   → 原因：网络问题，无法连接百度鉴权接口");
    } else {
      console.log("   → 原因：代码语法错误：", error.message);
    }
    return false;
  }
}

// 执行测试
testBaiduKey();
