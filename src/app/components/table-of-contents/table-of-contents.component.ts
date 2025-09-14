import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DOCUMENT } from '@angular/common';

interface TocItem {
  id: string;
  text: string;
  level: number;
  children: TocItem[];
  parent?: TocItem;
  originalIndex?: number;
}

@Component({
  selector: 'app-table-of-contents',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './table-of-contents.component.html',
  styleUrls: ['./table-of-contents.component.scss']
})
export class TableOfContentsComponent implements OnInit, OnChanges, OnDestroy {
  private document = inject(DOCUMENT);
  @Input() content = '';
  tocItems: TocItem[] = [];
  hierarchicalTocItems: TocItem[] = []; // Top-level items for display
  isCollapsed = false;
  isSticky = false;
  activeId = '';
  isMobile = false;

  ngOnInit(): void {
    // Check if we're on a mobile device
    this.checkIfMobile();

    // Listen for window resize events to update mobile detection
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.checkIfMobile.bind(this));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content'] && changes['content'].currentValue) {
      // Let's fix the issue with front matter in markdown
      // Use setTimeout to ensure the DOM has loaded the content
      setTimeout(() => {
        this.generateToc();
        this.setupScrollListeners();
      }, 500);
    }
  }

  ngOnDestroy(): void {
    // Clean up scroll event listener
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.handleScroll.bind(this));
      window.removeEventListener('resize', this.checkIfMobile.bind(this));
    }
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSticky(): void {
    // Don't enable sticky mode on mobile
    if (this.isMobile) {
      this.isSticky = false;
      return;
    }
    this.isSticky = !this.isSticky;
  }

  // Check if we're on a mobile device
  private checkIfMobile(): void {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 768;

      // Disable sticky mode on mobile
      if (this.isMobile && this.isSticky) {
        this.isSticky = false;
      }
    }
  }

  // Listen for scroll events to highlight the current section in TOC
  private setupScrollListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    }
  }

  private handleScroll(): void {
    if (this.tocItems.length === 0) return;

    // Find all section headings
    const headings: HTMLElement[] = [];

    // Try to find all heading elements that might match our IDs
    this.tocItems.forEach(item => {
      // First try by ID
      let heading = this.document.getElementById(item.id);

      // If not found, try by matching text content
      if (!heading) {
        for (let i = 1; i <= 6; i++) {
          Array.from(this.document.querySelectorAll(`h${i}`)).forEach(h => {
            if (this.generateHeaderId(h.textContent || '') === item.id) {
              heading = h as HTMLElement;
            }
          });
        }
      }

      if (heading) {
        headings.push(heading);
      }
    });

    // Exit if no headings found
    if (headings.length === 0) return;

    // Find the heading that's currently in view
    const scrollPosition = window.scrollY + 100; // Add offset for header

    let currentHeading: HTMLElement | null = null;

    // Find the last heading that's above the current scroll position
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      if (heading.offsetTop <= scrollPosition) {
        currentHeading = heading;
        break;
      }
    }

    // If we found a current heading, update active ID
    if (currentHeading) {
      const headingId = currentHeading.id ||
                      this.generateHeaderId(currentHeading.textContent || '');

      if (this.activeId !== headingId) {
        this.activeId = headingId;
      }
    }
  }

  private generateToc(): void {
    // Reset TOC items
    this.tocItems = [];
    this.hierarchicalTocItems = [];

    try {
      // First try to find headings in the rendered DOM
      this.extractHeadingsFromDOM();

      // If no headings found in DOM, try to parse from markdown
      if (this.tocItems.length === 0 && this.content) {
        this.extractHeadingsFromMarkdown();
      }

      // If we still don't have any TOC items, log a warning
      if (this.tocItems.length === 0) {
        console.warn('No headings found for table of contents');
      } else {
        // Organize TOC items into a hierarchical structure
        this.buildHierarchy();
      }
    } catch (error) {
      console.error('Error generating table of contents:', error);
    }
  }

  // Extract headings directly from the rendered DOM
  private extractHeadingsFromDOM(): void {

    // Find the blog content container
    const blogContent = this.document.querySelector('.blog-content');

    if (!blogContent) {
      return;
    }

    // Look for heading elements in the blog content
    const headings: HTMLElement[] = [];
    for (let i = 1; i <= 4; i++) { // Get h1 through h4
      const headingElements = blogContent.querySelectorAll(`h${i}`);
      Array.from(headingElements).forEach(heading => {
        headings.push(heading as HTMLElement);
      });
    }

    // Create TOC items from DOM headings
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent || '';

      // Skip empty headings
      if (!text.trim()) return;

      // Use the heading's ID if it has one, otherwise generate one
      const id = heading.id || this.generateHeaderId(text);

      // Set ID on the heading element if it doesn't have one
      if (!heading.id) {
        heading.id = id;
      }

      this.tocItems.push({
        id,
        text,
        level,
        children: [],
        originalIndex: index
      });
    });
  }

  // Parse markdown content for headers
  private extractHeadingsFromMarkdown(): void {
    // Skip front matter section at the beginning (between --- markers)
    const contentWithoutFrontMatter = this.content.replace(/^---(.|\n)*?---/m, '').trim();

    // Regular expression to match markdown headers
    // Matches # Header, ## Header, ### Header, etc.
    const headerRegex = /^(#{1,6})\s+(.+?)(?:\r?\n|$)/gm;

    let match;
    let index = 0;
    while ((match = headerRegex.exec(contentWithoutFrontMatter)) !== null) {
      const level = match[1].length; // Number of # symbols
      let text = match[2].trim();

      // Skip empty headers
      if (!text) continue;

      // Remove any markdown formatting within the header text
      text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
             .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // Remove bold/italic
             .replace(/`([^`]+)`/g, '$1'); // Remove inline code

      // Generate ID from text - matching AnalogJS/markdown-it ID generation
      const id = this.generateHeaderId(text);

      // Add to TOC items if level is 1-4
      if (level <= 4) {
        this.tocItems.push({
          id,
          text,
          level,
          children: [],
          originalIndex: index++
        });
      }
    }
  }

  /**
   * Builds a hierarchical table of contents by analyzing the heading text and levels
   * to properly organize numbered sections like 1., 1.1., 2., etc.
   */
  private buildHierarchy(): void {
    if (this.tocItems.length === 0) return;

    // Reset hierarchical items
    this.hierarchicalTocItems = [];

    // First, sort items by their original order to ensure we process them in document order
    const orderedItems = [...this.tocItems].sort((a, b) => {
      return a.originalIndex !== undefined && b.originalIndex !== undefined
        ? a.originalIndex - b.originalIndex
        : 0;
    });

    // Create a structure that can represent our hierarchy
    const numberPattern = /^(\d+(?:\.\d+)*)\.\s+(.+)/;
    const sections: {[key: string]: TocItem} = {};
    const topLevel: TocItem[] = [];

    // First pass: Identify section numbers and prepare structure
    for (const item of orderedItems) {
      // Clear children array to start fresh
      item.children = [];

      // Check if the item has a section number pattern (like "1.", "1.1.", etc.)
      const match = item.text.match(numberPattern);

      if (match) {
        // This is a numbered section
        const sectionNumber = match[1]; // e.g., "1", "1.1"
        const sectionParts = sectionNumber.split('.');

        // Store the item with its section number as key
        sections[sectionNumber] = item;

        // If it's a top-level section (like "1.")
        if (sectionParts.length === 1) {
          topLevel.push(item);
        }
      } else {
        // Non-numbered heading, just add to top level
        topLevel.push(item);
      }
    }

    // Second pass: Build the hierarchy based on section numbers
    for (const sectionNumber in sections) {
      const item = sections[sectionNumber];
      const sectionParts = sectionNumber.split('.');

      // Skip top level items, already added to topLevel
      if (sectionParts.length === 1) continue;

      // Find parent section number (remove the last part)
      const parentSectionNumber = sectionParts.slice(0, -1).join('.');

      // If we have a parent section, add this as a child
      if (sections[parentSectionNumber]) {
        const parentItem = sections[parentSectionNumber];
        parentItem.children.push(item);
        item.parent = parentItem;
      } else {
        // No parent found, add to top level
        topLevel.push(item);
      }
    }

    // Update hierarchical items
    this.hierarchicalTocItems = topLevel;
  }

  // Helper method to generate header IDs similar to how markdown-it does it
  private generateHeaderId(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special chars except whitespace and hyphens
      .replace(/\s+/g, '-') // Replace whitespace with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  scrollToSection(event: Event, id: string): void {
    event.preventDefault();

    // First try finding the element by its ID
    let element = this.document.getElementById(id);

    // If not found, try to find heading elements that might have the ID
    if (!element) {
      // Try all heading tags (h1-h6) that might match our generated ID
      for (let i = 1; i <= 6; i++) {
        const headings = this.document.querySelectorAll(`h${i}`);
        // Convert NodeList to Array before using forEach
        Array.from(headings).forEach(heading => {
          // Check if this heading's text would generate our ID
          const headingText = heading.textContent || '';
          const generatedId = this.generateHeaderId(headingText);

          if (generatedId === id) {
            element = heading as HTMLElement;
          }
        });
        if (element) break;
      }
    }

    if (element) {
      // Smooth scroll to the element with a small offset
      const yOffset = -80; // Adjust this value based on your header height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });

      // Add highlight effect temporarily
      element.classList.add('highlight-header');
      const highlightedElement = element; // Create a local reference
      setTimeout(() => {
        highlightedElement.classList.remove('highlight-header');
      }, 1500);

      // Update URL hash without reloading the page
      // Get the current path without the hash
      const currentPath = window.location.pathname;

      // Push the new state to history stack to preserve navigation history
      history.pushState({}, '', `${currentPath}#${id}`);

      // Update active ID
      this.activeId = id;
    }
  }
}
