// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SkinDiagnostic } from '../components/SkinDiagnostic';
import { SettingsProvider } from '../context/SettingsContext';
import { UiProvider } from '../context/UiContext';
import { LanguageProvider } from '../context/LanguageContext';
import { LoyaltyProvider } from '../context/LoyaltyContext';
import { ThemeProvider } from '../context/ThemeContext';
import { CartProvider } from '../context/CartContext';
import { ProductsProvider } from '../context/ProductsContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { AmPmProvider } from '../context/AmPmContext';
import { CompareProvider } from '../context/CompareContext';
import { WishlistProvider } from '../context/WishlistContext';

// Helper to wrap all required contexts
const AllProvidersWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SettingsProvider>
      <UiProvider>
        <LanguageProvider>
          <LoyaltyProvider>
            <ThemeProvider>
              <ProductsProvider>
                <CartProvider>
                  <CurrencyProvider>
                    <AmPmProvider>
                      <CompareProvider>
                        <WishlistProvider>
                          {children}
                        </WishlistProvider>
                      </CompareProvider>
                    </AmPmProvider>
                  </CurrencyProvider>
                </CartProvider>
              </ProductsProvider>
            </ThemeProvider>
          </LoyaltyProvider>
        </LanguageProvider>
      </UiProvider>
    </SettingsProvider>
  );
};

describe('SkinDiagnostic Component & WebRTC Camera Tests', () => {
  const mockTrackStop = vi.fn();
  const mockStream = {
    getTracks: () => [
      {
        stop: mockTrackStop,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock global fetch to return mock products and diagnostics response
    const mockProducts = [
      { id: 15, title: 'Anua Cleansing Oil', nameFr: 'Huile Nettoyante Anua', vendor: 'Anua', price: 180, comparePrice: 200, category: 'visage', tags: ['visage'], rating: 5, reviews: 12, description: 'Cleanser', ingredients: 'Centella', usage: 'Cleanse' },
      { id: 22, title: 'Anua Cleansing Foam', nameFr: 'Mousse Nettoyante Anua', vendor: 'Anua', price: 140, comparePrice: 160, category: 'visage', tags: ['visage'], rating: 5, reviews: 9, description: 'Foam', ingredients: 'Salicylic Acid', usage: 'Cleanse' },
      { id: 3, title: 'Garnier Vitamin C Serum', nameFr: 'Sérum Vitamine C Garnier', vendor: 'Garnier', price: 90, comparePrice: 100, category: 'visage', tags: ['visage'], rating: 4.8, reviews: 45, description: 'Brightening', ingredients: 'Vitamin C', usage: 'Apply morning' }
    ];

    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      const urlStr = typeof url === 'string' ? url : (url instanceof URL ? url.toString() : '');
      if (urlStr.includes('/api/products')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, products: mockProducts }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);
    });

    // Mock HTMLVideoElement methods
    HTMLVideoElement.prototype.play = vi.fn().mockResolvedValue(undefined);

    // Mock Canvas 2D Context
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      translate: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
      setTransform: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(4 * 640 * 480),
      }),
      putImageData: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
    } as any);

    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,mockBlueprintDataUrl');

    // Mock WebRTC MediaDevices API
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      writable: true,
      configurable: true,
    });
  });

  it('should render the diagnostic modal welcome screen when open', async () => {
    const handleClose = vi.fn();
    await act(async () => {
      render(<SkinDiagnostic isOpen={true} onClose={handleClose} />, { wrapper: AllProvidersWrapper });
    });

    expect(screen.getByText(/Dermo-IA Diagnostic/i)).toBeDefined();
    expect(screen.getByText(/Commencer l'analyse/i)).toBeDefined();
  });

  it('should flow through the questionnaire steps correctly and render products', async () => {
    const handleClose = vi.fn();
    await act(async () => {
      render(<SkinDiagnostic isOpen={true} onClose={handleClose} />, { wrapper: AllProvidersWrapper });
    });

    // Step 0 -> Step 1
    const startBtn = screen.getByText(/Commencer l'analyse/i);
    fireEvent.click(startBtn);

    // Wait 350ms for questionnaire transition
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    // Wait for step 1: Skin Type Question (Profil Séborrhéique matches Oily)
    expect(screen.getByText(/Quel est votre profil ou typologie cutanée/i)).toBeDefined();

    // Select skin type 'Profil Séborrhéique' (Oily)
    const oilyOption = screen.getByText(/Profil Séborrhéique/i);
    fireEvent.click(oilyOption);

    // Wait 350ms for transition
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    // Auto-advance to Step 2: Main Concern
    expect(screen.getByText(/Quelle est la préoccupation épidermique majeure/i)).toBeDefined();

    // Select concern 'Imperfections Acnéiques'
    const acneOption = screen.getByText(/Imperfections Acnéiques/i);
    fireEvent.click(acneOption);

    // Wait 350ms for transition
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    // Auto-advance to Step 3: Sun Exposure
    expect(screen.getByText(/Quel est le niveau d'exposition de votre peau/i)).toBeDefined();

    // Select sun exposure 'Exposition Solaire Intermédiaire'
    const sunOption = screen.getByText(/Exposition Solaire Intermédiaire/i);
    fireEvent.click(sunOption);

    // Wait 350ms for transition
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    // Auto-advance to Step 4: Camera Scan View
    expect(screen.getByText(/Analyse Spectrale en Direct/i)).toBeDefined();

    // Wait for async getUserMedia promise to resolve in useEffect
    const skipBtn = await screen.findByText(/Ignorer le scan et voir les résultats/i);
    expect(skipBtn).toBeDefined();

    // Click skip to trigger results and recommendations
    fireEvent.click(skipBtn);

    // Wait 100ms for state update to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify results page is rendered
    expect(screen.getByText(/Routine Anti-Imperfections & Pureté/i)).toBeDefined();
    
    // Verify recommended products matching "acne" concern (Anua Cleansing Oil / Foam) are recommended
    expect(screen.getByText(/Anua Cleansing Oil/i)).toBeDefined();
    expect(screen.getByText(/Anua Cleansing Foam/i)).toBeDefined();
  });
});
