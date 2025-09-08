import { renderHook, waitFor } from '@testing-library/react';
import { useEpub } from './useEpub';
import ePub from 'epubjs';
import { supabase } from '@/integrations/supabase/client';

// Mock epubjs
jest.mock('epubjs');
const mockEpub = ePub as jest.Mock;

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnThis(),
      download: jest.fn(),
    },
  },
}));
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useEpub', () => {
  it('should load all sections from the spine and use TOC for labels', async () => {
    // 1. Arrange
    const mockSpineItems = Array.from({ length: 5 }, (_, i) => ({
      idref: `section-${i + 1}`,
      href: `section-${i + 1}.xhtml`,
      canonical: `ops/section-${i + 1}.xhtml`,
      load: jest.fn().mockImplementation(function() {
        this.document = {
          body: {
            textContent: `This is section ${i + 1}.`,
            innerHTML: `<p>This is section ${i + 1}.</p>`,
          },
        };
        return Promise.resolve();
      }),
      document: {
        body: {
            textContent: `This is section ${i + 1}.`,
            innerHTML: `<p>This is section ${i + 1}.</p>`,
        }
      }
    }));

    const mockToc = [
      { id: 'toc-1', href: 'section-1.xhtml', label: 'Chapter 1' },
      { id: 'toc-3', href: 'section-3.xhtml', label: 'Chapter 3' },
    ];

    const mockBook = {
      ready: Promise.resolve(),
      navigation: {
        toc: mockToc,
      },
      spine: {
        items: mockSpineItems,
      },
      path: {
        resolve: (href: string) => `ops/${href}`,
      },
      load: jest.fn(),
      section: jest.fn(index => mockSpineItems[index]),
    };
    mockEpub.mockReturnValue(mockBook);

    // Mock file download
    const mockFileData = new Blob(['fake-epub-content']);
    mockSupabase.storage.from('ebooks').download.mockResolvedValue({
      data: mockFileData,
      error: null,
    });

    // 2. Act
    const { result } = renderHook(() => useEpub('fake-path.epub'));

    // 3. Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.chapters.length).toBe(5); // All 5 sections should be loaded
    expect(result.current.chapters[0].label).toBe('Chapter 1'); // From TOC
    expect(result.current.chapters[1].label).toBe('Chapter 2'); // Generic label
    expect(result.current.chapters[2].label).toBe('Chapter 3'); // From TOC
    expect(result.current.chapters[3].label).toBe('Chapter 4'); // Generic label
    expect(result.current.chapters[4].label).toBe('Chapter 5'); // Generic label
  });
});
