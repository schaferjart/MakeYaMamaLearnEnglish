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

// Mock section loading for chapters
const mockSection = (textContent: string) => ({
  load: jest.fn().mockImplementation(function() {
    this.document = {
      body: { textContent, innerHTML: `<p>${textContent}</p>` },
    };
    return Promise.resolve();
  }),
  document: {
    body: { textContent, innerHTML: `<p>${textContent}</p>` },
  },
});

describe('useEpub with nested TOC', () => {
  it('should correctly flatten a nested TOC and load all chapters', async () => {
    // 1. Arrange
    const mockNestedToc = [
      { id: 'title', href: 'title.xhtml', label: 'Title Page' },
      {
        id: 'p1',
        href: 'p1.xhtml',
        label: 'Part 1',
        subitems: [
          { id: 'p1c1', href: 'p1c1.xhtml', label: 'Chapter 1' },
          { id: 'p1c2', href: 'p1c2.xhtml', label: 'Chapter 2' },
        ],
      },
      {
        id: 'p2',
        label: 'Part 2', // No href, should be skipped but subitems processed
        subitems: [
            { id: 'p2c1', href: 'p2c1.xhtml', label: 'Chapter 3' },
        ]
      },
      { id: 'appendix', href: 'appendix.xhtml', label: 'Appendix' },
    ];

    const mockBook = {
      ready: Promise.resolve(),
      navigation: {
        toc: mockNestedToc,
      },
      load: jest.fn(), // Mock the load property
      section: jest.fn((href) => {
        return mockSection(`Content of ${href}`);
      }),
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

    // There are 6 items with an href, so 6 chapters should be loaded.
    // "Part 2" itself is skipped because it has no href, but its sub-item is included.
    expect(result.current.chapters.length).toBe(6);
    expect(result.current.error).toBeNull();

    // Check if the labels are correct and in the correct flattened order
    expect(result.current.chapters[0].label).toBe('Title Page');
    expect(result.current.chapters[1].label).toBe('Part 1');
    expect(result.current.chapters[2].label).toBe('Chapter 1');
    expect(result.current.chapters[3].label).toBe('Chapter 2');
    expect(result.current.chapters[4].label).toBe('Chapter 3');
    expect(result.current.chapters[5].label).toBe('Appendix');
  });
});
