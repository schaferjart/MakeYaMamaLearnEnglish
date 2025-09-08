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
  it('should load all sections from the spine if TOC is empty', async () => {
    // 1. Arrange
    const mockSpineItems = Array.from({ length: 150 }, (_, i) => ({
      idref: `section-${i + 1}`,
      href: `section-${i + 1}.xhtml`,
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

    const mockBook = {
      ready: Promise.resolve(),
      navigation: {
        toc: [], // Empty TOC
      },
      spine: {
        items: mockSpineItems,
      },
      load: jest.fn(),
      section: jest.fn(index => mockSpineItems[index]),
    };
    mockEpub.mockReturnValue(mockBook);

    // Mock file download
    const mockFileData = new Blob(['fake-epub-content']);
    const mockFileArrayBuffer = await mockFileData.arrayBuffer();
    mockSupabase.storage.from('ebooks').download.mockResolvedValue({
      data: mockFileData,
      error: null,
    });

    // 2. Act
    const { result } = renderHook(() => useEpub('fake-path.epub'));

    // 3. Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.chapters.length).toBe(150); // Check if all 150 sections are loaded
    expect(result.current.chapters[149].label).toBe('section-150');
  });
});
