import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import { renderWithProviders } from '@/lib/test-utils';
import LoginPage from '@/app/(auth)/login/page';
import { authService } from '@/services/auth.service';

jest.mock('@/services/auth.service', () => ({
  authService: {
    login: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockPush = jest.fn();
const mockGet = jest.fn(() => null);

(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
(useSearchParams as jest.Mock).mockReturnValue({ get: mockGet });

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue(null);
  });

  it('يعرض حقول البريد الإلكتروني وكلمة المرور وزر الإرسال', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByPlaceholderText('ahmed@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /تسجيل الدخول/ })).toBeInTheDocument();
  });

  it('يعرض خطأ عندما يكون البريد الإلكتروني فارغًا', async () => {
    renderWithProviders(<LoginPage />);

    const submitBtn = screen.getByRole('button', { name: /تسجيل الدخول/ });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/البريد الإلكتروني مطلوب/)).toBeInTheDocument();
    });
  });

  it('يستدعي authService.login عند الإرسال ببيانات صحيحة', async () => {
    (authService.login as jest.Mock).mockResolvedValueOnce({
      user: { id: '1' },
      organization: { id: 'org1' },
    });

    renderWithProviders(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText('ahmed@example.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), 'password');
    await userEvent.click(screen.getByRole('button', { name: /تسجيل الدخول/ }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      });
    });
  });

  it('يعرض رسالة خطأ من API عند فشل تسجيل الدخول', async () => {
    (authService.login as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

    renderWithProviders(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText('ahmed@example.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), 'password');
    await userEvent.click(screen.getByRole('button', { name: /تسجيل الدخول/ }));

    await waitFor(() => {
      expect(screen.getByText(/فشل تسجيل الدخول/)).toBeInTheDocument();
    });
  });

  it('يعطل الزر أثناء التحميل', async () => {
    (authService.login as jest.Mock).mockReturnValueOnce(new Promise(() => {}));

    renderWithProviders(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText('ahmed@example.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), 'password');
    await userEvent.click(screen.getByRole('button', { name: /تسجيل الدخول/ }));

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});