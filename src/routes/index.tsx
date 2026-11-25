import { onSettled } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import Seo from '../components/Seo';

/** 首页 → Diary（与 CF _redirects 一致） */
export default function Home() {
  const navigate = useNavigate();

  onSettled(() => {
    navigate('/diary/', { replace: true });
  });

  return <Seo title="abei" path="/" />;
}
