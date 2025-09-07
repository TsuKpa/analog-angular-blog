import { EducationComponent } from './../../components/education/education.component';
import { CertificationsComponent } from './../../components/certifications/certifications.component';
import { SkillsComponent } from './../../components/skills/skills.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { WorkExperienceComponent } from '../../components/work-experience/work-experience.component';
import { SocialComponent } from './../../components/social/social.component';
import { MetaTagService } from '../../services/meta.service';
import { UrlService } from '../../services/url.service';

@Component({
  selector: 'app-about',
  imports: [
    CommonModule,
    WorkExperienceComponent,
    CertificationsComponent,
    EducationComponent,
    SkillsComponent,
    SocialComponent,
  ],
  templateUrl: './index.page.html',
  styles: [
    `
      /* You can add global styles to this file, and also import other style files */
      @keyframes wave {
        0% {
          transform: rotate(0deg);
        }
        10% {
          transform: rotate(14deg);
        }
        20% {
          transform: rotate(-8deg);
        }
        30% {
          transform: rotate(14deg);
        }
        40% {
          transform: rotate(-4deg);
        }
        50% {
          transform: rotate(10deg);
        }
        60% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(0deg);
        }
      }
      .animate-wave {
        animation: wave 2.5s infinite;
        display: inline-block;
        transform-origin: 70% 70%;
      }
    `,
  ],
})
export default class AboutPage implements OnInit {
  private readonly metaTagService = inject(MetaTagService);
  private readonly urlService = inject(UrlService);

  avatarUrl = this.urlService.getImageUrl('avatar-blog.jpg');

  ngOnInit() {
    this.metaTagService.updateMetaTags({
      title: 'About - Tsukpa - Software Developer & Technical Writer',
      description: 'Learn more about Tsukpa, my skills, certifications, experience, and background as a software developer.',
      url: `${this.metaTagService.siteUrl}/about`,
      type: 'profile'
    });
  }
}
