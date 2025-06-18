import EditJobClient from '@/app/components/EditJobClient';
import { use } from 'react';

interface PageProps {
  params: Promise<{ rowuid: string }>;
}

export default function Page({ params }: PageProps) {
  const { rowuid } = use(params);
  return <EditJobClient rowuid={rowuid} />;
}