import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
import 'dayjs/locale/zh-cn';

// 配置dayjs
dayjs.locale('zh-cn');
dayjs.extend(relativeTime);
dayjs.extend(calendar);

export const formatMessageTime = (date: Date): string => {
  const now = dayjs();
  const messageTime = dayjs(date);

  // 如果是今天
  if (messageTime.isSame(now, 'day')) {
    return messageTime.format('HH:mm');
  }

  // 如果是昨天
  if (messageTime.isSame(now.subtract(1, 'day'), 'day')) {
    return `昨天 ${messageTime.format('HH:mm')}`;
  }

  // 如果是本周内
  if (messageTime.isAfter(now.subtract(7, 'day'))) {
    return messageTime.calendar(null, {
      sameDay: 'HH:mm',
      lastDay: '昨天 HH:mm',
      lastWeek: 'dddd HH:mm',
      sameElse: 'MM-DD HH:mm'
    });
  }

  // 如果是今年
  if (messageTime.isSame(now, 'year')) {
    return messageTime.format('MM-DD HH:mm');
  }

  // 其他情况显示完整日期
  return messageTime.format('YYYY-MM-DD HH:mm');
};

export const formatRelativeTime = (date: Date): string => {
  return dayjs(date).fromNow();
};
