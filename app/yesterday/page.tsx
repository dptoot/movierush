'use client';

import GameBoard from '@/components/GameBoard';
import { getYesterdayLocalDate } from '@/lib/date-utils';

export default function YesterdayPage() {
  return <GameBoard date={getYesterdayLocalDate()} />;
}
