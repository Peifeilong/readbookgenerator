// about页面 对应静态路由 /about
'use client';

import { useParams } from 'next/navigation';

export default function About() {
  const params = useParams();
  const { id } = params;  // 获取动态路由参数 `id`

  return <div>about: {id}</div>;
}