"use client";
import { useState } from "react";
// 引入独立的CSS模块
import styles from "../../styles/redbookGenerator.module.css";

export default function RedbookGenerator() {
  const [styleType, setStyleType] = useState("活泼");
  const [track, setTrack] = useState("美妆");
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectFocus, setSelectFocus] = useState({
    style: false,
    track: false,
  });
  const [textareaFocus, setTextareaFocus] = useState(false);
  const [cardHover, setCardHover] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const generateCopy = async () => {
    if (!keyword.trim()) {
      alert("请输入核心卖点！");
      return;
    }

    setLoading(true);
    setResult("");
    let accumulatedContent = "";

    try {
      const res = await fetch("/api/redbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style: styleType, track, keyword }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `请求失败：${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setResult(accumulatedContent);
          break;
        }

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;
          setResult(accumulatedContent);
        }
      }
    } catch (error) {
      console.error("生成失败：", error);
      setResult(`😭 生成失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      alert("复制失败，请手动复制！");
      console.error("复制失败：", error);
    }
  };

  const clearAll = () => {
    setKeyword("");
    setResult("");
  };

  return (
    <div className={styles.container}>
      {/* 头部标题 */}
      <header className={styles.header}>
        <h1 className={styles.title}>✨ 小红书文案生成器</h1>
        <p className={styles.subtitle}>
          输入核心卖点，一键生成高吸引力的小红书文案
        </p>
      </header>

      {/* 输入卡片 */}
      <div
        className={`${styles.card} ${cardHover ? styles.cardHover : ""}`}
        onMouseEnter={() => setCardHover(true)}
        onMouseLeave={() => setCardHover(false)}
      >
        {/* 风格和赛道选择 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>📝 文案风格 & 内容赛道</label>
          <div className={styles.selectWrapper}>
            <select
              value={styleType}
              onChange={(e) => setStyleType(e.target.value)}
              className={`${styles.select} ${
                selectFocus.style ? styles.selectFocus : ""
              }`}
              onFocus={() => setSelectFocus({ ...selectFocus, style: true })}
              onBlur={() => setSelectFocus({ ...selectFocus, style: false })}
              disabled={loading}
            >
              <option value="活泼">活泼</option>
              <option value="温柔">温柔</option>
              <option value="干货">干货</option>
              <option value="搞笑">搞笑</option>
              <option value="氛围感">氛围感</option>
            </select>

            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className={`${styles.select} ${
                selectFocus.track ? styles.selectFocus : ""
              }`}
              onFocus={() => setSelectFocus({ ...selectFocus, track: true })}
              onBlur={() => setSelectFocus({ ...selectFocus, track: false })}
              disabled={loading}
            >
              <option value="美妆">美妆</option>
              <option value="穿搭">穿搭</option>
              <option value="美食">美食</option>
              <option value="家居">家居</option>
              <option value="职场">职场</option>
              <option value="母婴">母婴</option>
            </select>
          </div>
        </div>

        {/* 核心卖点输入 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>🎯 核心卖点（必填）</label>
          <textarea
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="例如：这支口红显白不挑皮，黄皮闭眼入，持久不沾杯..."
            className={`${styles.textarea} ${
              textareaFocus ? styles.textareaFocus : ""
            }`}
            onFocus={() => setTextareaFocus(true)}
            onBlur={() => setTextareaFocus(false)}
            disabled={loading}
          />
        </div>

        {/* 按钮组 */}
        <div className={styles.buttonGroup}>
          <button
            onClick={generateCopy}
            disabled={loading}
            className={`${styles.primaryButton} ${
              loading ? styles.primaryButtonDisabled : ""
            }`}
          >
            {loading ? (
              <>
                <div className={styles.loadingSpinner} />
                生成中...
              </>
            ) : (
              <>✍️ 生成小红书文案</>
            )}
          </button>

          <button
            onClick={clearAll}
            disabled={loading}
            className={styles.secondaryButton}
          >
            🗑️ 清空内容
          </button>
        </div>
      </div>

      {/* 结果展示 */}
      {result && (
        <div className={styles.resultCard}>
          <h3 className={styles.resultTitle}>📄 生成结果</h3>
          <div className={styles.resultContent}>{result}</div>
          <button
            onClick={copyToClipboard}
            className={`${styles.copyButton} ${
              copySuccess ? styles.copyButtonSuccess : ""
            }`}
            disabled={loading}
          >
            {copySuccess ? "✅ 复制成功" : "📋 复制文案"}
          </button>
        </div>
      )}
    </div>
  );
}
