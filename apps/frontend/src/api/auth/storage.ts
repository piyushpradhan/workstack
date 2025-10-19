class TokenStorage {
    private static readonly TOKEN_KEY = 'authToken';
    private static readonly REFRESH_TOKEN_KEY = 'refreshToken';

    static getToken(): string | null {
        try {
            return localStorage.getItem(this.TOKEN_KEY);
        } catch (error) {
            console.error('Failed to get token from storage:', error);
            return null;
        }
    }

    static setToken(token: string): void {
        try {
            localStorage.setItem(this.TOKEN_KEY, token);
        } catch (error) {
            console.error('Failed to set token in storage:', error);
        }
    }

    static getRefreshToken(): string | null {
        try {
            return localStorage.getItem(this.REFRESH_TOKEN_KEY);
        } catch (error) {
            console.error('Failed to get refresh token from storage:', error);
            return null;
        }
    }

    static setRefreshToken(refreshToken: string): void {
        try {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        } catch (error) {
            console.error('Failed to set refresh token in storage:', error);
        }
    }

    static clearTokens(): void {
        try {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        } catch (error) {
            console.error('Failed to clear tokens from storage:', error);
        }
    }

    static isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export default TokenStorage;
