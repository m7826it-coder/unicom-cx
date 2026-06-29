import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/lib/test-utils';
import ConversationItem from '@/components/inbox/conversation-item';
import type { ConversationSummary } from '@/types/inbox.types';

const mockConversation: ConversationSummary = {
  id: 'conv-1',
  customerId: 'cust-1',
  customer: { id: 'cust-1', name: 'خالد العميل', avatar: null },
  channel: 'WHATSAPP',
  status: 'OPEN',
  classification: 'INQUIRY',
  assignedTo: null,
  assignedAgent: null,
  lastMessage: { content: 'أريد الاستفسار عن طلبيتي', senderType: 'CUSTOMER', createdAt: new Date().toISOString() },
  lastMessageAt: new Date().toISOString(),
  unreadCount: 2,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ConversationItem', () => {
  const mockOnClick = jest.fn();

  it('يعرض اسم العميل', () => {
    renderWithProviders(
      <ConversationItem conversation={mockConversation} isActive={false} onClick={mockOnClick} />
    );

    expect(screen.getByText('خالد العميل')).toBeInTheDocument();
  });

  it('يعرض آخر رسالة', () => {
    renderWithProviders(
      <ConversationItem conversation={mockConversation} isActive={false} onClick={mockOnClick} />
    );

    expect(screen.getByText('أريد الاستفسار عن طلبيتي')).toBeInTheDocument();
  });

  it('يعرض شارة غير مقروء عندما unreadCount > 0', () => {
    renderWithProviders(
      <ConversationItem conversation={mockConversation} isActive={false} onClick={mockOnClick} />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('لا يعرض شارة غير مقروء عندما unreadCount = 0', () => {
    const conv = { ...mockConversation, unreadCount: 0 };
    renderWithProviders(
      <ConversationItem conversation={conv} isActive={false} onClick={mockOnClick} />
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('يستدعي onClick عند النقر', async () => {
    renderWithProviders(
      <ConversationItem conversation={mockConversation} isActive={false} onClick={mockOnClick} />
    );

    await userEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('يطبق تنسيق bg-accent عندما isActive', () => {
    const { container } = renderWithProviders(
      <ConversationItem conversation={mockConversation} isActive={true} onClick={mockOnClick} />
    );

    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-accent');
  });
});