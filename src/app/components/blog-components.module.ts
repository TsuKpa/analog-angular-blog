import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogImageComponent } from './blog-image/blog-image.component';
import { ImageModalComponent } from './image-modal/image-modal.component';

@NgModule({
  imports: [
    CommonModule,
    BlogImageComponent,
    ImageModalComponent
  ],
  exports: [
    BlogImageComponent,
    ImageModalComponent
  ]
})
export class BlogComponentsModule {}
