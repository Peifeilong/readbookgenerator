// 动态路由页面 如/post/123 
'use client';

import { useParams } from 'next/navigation';

export default function Post() {
  const params = useParams();
  const { id } = params;  // 获取动态路由参数 `id`

  return <div>Post ID: {id}</div>;
}