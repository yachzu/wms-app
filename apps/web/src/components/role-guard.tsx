import { useAuthStore } from '@/store/auth-store';
import { ReactNode } from 'react';

interface RoleGuardProps {
    children: ReactNode;
    roles: string[];
    fallback?: ReactNode;
}

export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
    const user = useAuthStore((state) => state.user);

    if (!user || !roles.includes(user.role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
