// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
// 注意：请确保你的样式文件路径正确，若没有可注释此行
import styles from "../styles/redbookGenerator.module.css";

export default function RedbookGenerator() {
  // ===== 核心状态 =====
  const [styleType, setStyleType] = useState("活泼");
  const [track, setTrack] = useState("美妆");
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // ===== 历史记录相关状态 =====
  const [historyList, setHistoryList] = useState([]);
  const [expandStates, setExpandStates] = useState({}); // 控制每条记录的折叠状态

  // ===== localStorage 配置与工具函数 =====
  const STORAGE_KEY = "redbook_copy_history";

  // 保存记录到本地存储
  const saveCopyToHistory = (style, track, keyword, content) => {
    try {
      const rawHistory = localStorage.getItem(STORAGE_KEY);
      let history = rawHistory ? JSON.parse(rawHistory) : [];
      if (!Array.isArray(history)) history = [];

      const newRecord = {
        id: Date.now(),
        time: new Date().toLocaleString(),
        style,
        track,
        keyword,
        content,
      };

      history.unshift(newRecord);
      history = history.slice(0, 10); // 仅保留最近10条
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("保存历史记录失败：", error);
      alert("抱歉，历史记录保存失败，请稍后再试！");
    }
  };

  // 读取本地历史记录
  const getCopyHistory = () => {
    try {
      const rawHistory = localStorage.getItem(STORAGE_KEY);
      if (!rawHistory) return [];
      const history = JSON.parse(rawHistory);
      return Array.isArray(history) ? history : [];
    } catch (error) {
      console.error("读取历史记录失败：", error);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  };

  // 删除单条历史记录
  const deleteHistoryItem = (id) => {
    try {
      let history = getCopyHistory();
      history = history.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      setHistoryList(history);
      // 同步删除折叠状态
      setExpandStates((prev) => {
        const newStates = { ...prev };
        delete newStates[id];
        return newStates;
      });
    } catch (error) {
      console.error("删除历史记录失败：", error);
      alert("删除失败，请手动清空全部记录！");
    }
  };

  // 清空所有历史记录
  const clearAllHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistoryList([]);
      setExpandStates({});
    } catch (error) {
      console.error("清空历史记录失败：", error);
      alert("清空失败，请稍后再试！");
    }
  };

  // 切换折叠/展开状态
  const toggleExpand = (id) => {
    setExpandStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // ===== 页面加载时读取历史记录 =====
  useEffect(() => {
    const history = getCopyHistory();
    setHistoryList(history);
  }, []);

  // ===== 生成文案核心函数 =====
  const generateCopy = async () => {
    if (!keyword.trim()) {
      alert("请输入核心卖点！");
      return;
    }

    setLoading(true);
    setResult("");
    let accumulatedContent = "";

    try {
      // 调用后端API（请确保你的/api/redbook接口存在）
      const res: any = await fetch("/api/redbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style: styleType, track, keyword }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `请求失败：${res.status}`);
      }

      // 流式读取返回结果
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;
          setResult(accumulatedContent);
        }
      }

      // 生成成功后保存到历史记录
      saveCopyToHistory(styleType, track, keyword, accumulatedContent);
      setHistoryList(getCopyHistory());
    } catch (error) {
      console.error("生成文案失败：", error);
      setResult(`😭 生成失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== 页面渲染 =====
  return (
    <div
      className={styles.container}
      style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}
    >
      {/* 标题 */}
      <h2
        style={{ color: "#ff6b6b", textAlign: "center", marginBottom: "2rem" }}
      >
        📖 小红书文案生成器
      </h2>

      {/* 输入区域 */}
      <div
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          marginBottom: "1.5rem",
        }}
      >
        {/* 风格选择 */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{ display: "block", marginBottom: "0.5rem", color: "#666" }}
          >
            文案风格：
          </label>
          <select
            value={styleType}
            onChange={(e) => setStyleType(e.target.value)}
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "8px",
              border: "1px solid #eee",
            }}
          >
            <option value="活泼">活泼</option>
            <option value="温柔">温柔</option>
            <option value="专业">专业</option>
            <option value="搞笑">搞笑</option>
            <option value="文艺">文艺</option>
          </select>
        </div>

        {/* 赛道选择 */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{ display: "block", marginBottom: "0.5rem", color: "#666" }}
          >
            内容赛道：
          </label>
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "8px",
              border: "1px solid #eee",
            }}
          >
            <option value="美妆">美妆</option>
            <option value="穿搭">穿搭</option>
            <option value="美食">美食</option>
            <option value="家居">家居</option>
            <option value="旅行">旅行</option>
          </select>
        </div>

        {/* 卖点输入 */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{ display: "block", marginBottom: "0.5rem", color: "#666" }}
          >
            核心卖点：
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="例如：显白口红不挑皮、显瘦牛仔裤高腰"
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "8px",
              border: "1px solid #eee",
            }}
          />
        </div>

        {/* 生成按钮 */}
        <button
          onClick={generateCopy}
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.8rem",
            borderRadius: "8px",
            border: "none",
            background: "#ff6b6b",
            color: "white",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading ? "生成中... 🌀" : "生成文案"}
        </button>
      </div>

      {/* 结果展示区域 */}
      {result && (
        <div
          style={{
            background: "#fff",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ color: "#333", marginTop: 0, marginBottom: "1rem" }}>
            ✨ 生成结果：
          </h3>
          <div
            style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", color: "#333" }}
          >
            {result}
          </div>
          {/* 复制按钮 */}
          <button
            onClick={() => navigator.clipboard.writeText(result)}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "1px solid #ff6b6b",
              background: "white",
              color: "#ff6b6b",
              cursor: "pointer",
            }}
          >
            📋 复制文案
          </button>
        </div>
      )}

      {/* 历史记录展示区 */}
      {historyList.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          {/* 历史记录标题栏 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ color: "#ff6b6b", margin: 0, fontSize: "1.2rem" }}>
              📜 历史生成记录（最近10条）
            </h3>
            <button
              onClick={clearAllHistory}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                background: "white",
                color: "#666",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#f8f8f8";
                e.target.style.borderColor = "#ccc";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.borderColor = "#ddd";
              }}
            >
              🗑️ 清空全部
            </button>
          </div>

          {/* 历史记录列表 */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "1rem",
              background: "#fff",
              maxHeight: "400px",
              overflowY: "auto",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            {historyList.map((item: any) => (
              <div
                key={item.id}
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid #f5f5f5",
                  marginBottom: "0.5rem",
                  borderRadius: "8px",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#fafafa";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "white";
                }}
              >
                {/* 记录头部 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                    color: "#999",
                  }}
                >
                  <span>{item.time}</span>
                  <span>
                    {item.style} | {item.track} | 卖点：
                    {item.keyword.slice(0, 10)}
                    {item.keyword.length > 10 ? "..." : ""}
                  </span>
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#ff6b6b",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      padding: "0.2rem 0.4rem",
                      borderRadius: "4px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#ffe5e5";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                    }}
                  >
                    删除
                  </button>
                </div>

                {/* 文案内容（折叠/展开） */}
                <div
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                    color: "#333",
                    whiteSpace: "pre-wrap",
                    maxHeight: expandStates[item.id] ? "none" : "100px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    position: "relative",
                    paddingBottom: "1.5rem",
                  }}
                >
                  {item.content}

                  {/* 展开/收起按钮 */}
                  <button
                    onClick={() => toggleExpand(item.id)}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      background: "rgba(255,255,255,0.9)",
                      border: "1px solid #ff6b6b",
                      color: "#ff6b6b",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      padding: "0.2rem 0.8rem",
                      borderRadius: "4px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#ff6b6b";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(255,255,255,0.9)";
                      e.target.style.color = "#ff6b6b";
                    }}
                  >
                    {expandStates[item.id] ? "收起" : "展开"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
