import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isMobileMenuOpen = false;
  lastScrollTop = 0;
  scrollThreshold = 5; // Minimum scroll amount before toggling header visibility
  isHeaderVisible = true;
  private document = inject(DOCUMENT);

  ngOnInit() {
    // Initial setup
    setTimeout(() => this.updateHeaderState(), 0);
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.handleScroll();
  }

  private handleScroll() {
    if (typeof window === 'undefined') return;

    const currentScrollTop = window.scrollY || this.document.documentElement.scrollTop;

    // Add or remove scrolled class on body based on scroll position
    if (currentScrollTop > 10) {
      this.document.body.classList.add('scrolled');
    } else {
      this.document.body.classList.remove('scrolled');
    }

    // Determine if we're scrolling enough to trigger a state change
    if (Math.abs(currentScrollTop - this.lastScrollTop) > this.scrollThreshold) {
      // Only trigger header hide/show when scrolling a meaningful amount

      // When scrolling down AND not at the top of the page, hide the header
      if (currentScrollTop > this.lastScrollTop && currentScrollTop > 100) {
        this.isHeaderVisible = false;
      }
      // When scrolling up OR at the top of the page, show the header
      else if (currentScrollTop < this.lastScrollTop || currentScrollTop < 50) {
        this.isHeaderVisible = true;
      }

      // Update DOM
      this.updateHeaderState();

      // Save current position for next comparison
      this.lastScrollTop = currentScrollTop;
    }
  }

  private updateHeaderState() {
    const header = this.document.querySelector('.sticky-header') as HTMLElement;
    if (header) {
      if (this.isHeaderVisible) {
        header.classList.remove('header-hidden');
      } else {
        header.classList.add('header-hidden');
      }
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}
