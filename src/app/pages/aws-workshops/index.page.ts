import { Component, OnInit, computed, inject } from '@angular/core';
import { workshops, type WorkShop } from './data/workshop-data';
import { WorkshopCardComponent } from '../../components/workshop-card/workshop-card.component';
import { MetaTagService } from '../../services/meta.service';

@Component({
  selector: 'app-aws-workshops',
  standalone: true,
  imports: [WorkshopCardComponent],
  template: `
    <div class="py-8">
      <div class="text-center mb-12">
        <span class="inline-block bg-black text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">AWS Workshops</span>
        <h1 class="text-5xl font-bold text-gray-900 mb-4">Explore Hands-On Labs</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">Deepen your cloud skills with practical workshops on various AWS services and real-world scenarios.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (workshop of sortedWorkshops(); track workshop.id) {
          <app-workshop-card [workshop]="workshop" />
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export default class AwsWorkshopsComponent implements OnInit {
  private metaTagService = inject(MetaTagService);

  ngOnInit() {
    const workshopsUrl = `${this.metaTagService.siteUrl}/aws-workshops`;

    this.metaTagService.updateMetaTags({
      title: 'AWS Workshops - Learn Cloud Computing Hands-On',
      description: 'Free hands-on workshops to learn AWS cloud services with practical labs and step-by-step exercises.',
      url: workshopsUrl,
      canonical: workshopsUrl, // Set canonical URL
      type: 'website'
    });

    // Add collection page structured data for workshops
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': 'AWS Workshops - Learn Cloud Computing Hands-On',
      'description': 'Free hands-on workshops to learn AWS cloud services with practical labs and step-by-step exercises.',
      'url': workshopsUrl,
      'publisher': {
        '@type': 'Person',
        'name': 'Tsukpa',
        'url': `${this.metaTagService.siteUrl}/about`
      },
      'mainEntity': {
        '@type': 'ItemList',
        'itemListElement': this.sortedWorkshops().map((workshop, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'url': workshop.url || `${this.metaTagService.siteUrl}/aws-workshops`,
          'name': workshop.title,
          'description': this.cleanText(workshop.description)
        }))
      }
    });
    document.head.appendChild(script);
  }

  readonly sortedWorkshops = computed(() => {
    return [...workshops].sort((a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
  });

  cleanText(text: string): string {
    return text?.replace(/\s+/g, ' ').trim() || '';
  }
}
