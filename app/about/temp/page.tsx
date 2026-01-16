// 子路由
"use client";
import "../../../styles/temp.css";
import { useEffect, useState } from "react";
export default function Temp() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts");
      const data = await res.json();
      setPosts(data);
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <div>我是子路由temp</div>
      <ul className="tempUl">
        {posts.map((post: any) => (
          <li className="templi" key={post.id}>
            {post.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
