import { Component, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Category } from '../../core/models/category.model';
import { LanguageService } from '../../core/services/language.service';
import { CategoryTreeComponent } from '../category-tree/category-tree.component';

@Component({
  selector: 'app-category-dropdown',
  standalone: true,
  imports: [CommonModule, TranslateModule, CategoryTreeComponent],
  template: `
    <div class="relative group/trigger">

      <!-- ── Trigger Button ── -->
      <button
        class="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold
               text-on-surface-variant hover:text-primary hover:bg-primary/5
               transition-all duration-300 border border-transparent
               hover:border-primary/10 whitespace-nowrap select-none">
        <span class="material-symbols-outlined text-[22px]">grid_view</span>
        <span class="font-headline tracking-tight hidden sm:inline">
          {{ 'nav.categories' | translate }}
        </span>
        <span class="material-symbols-outlined text-[18px] opacity-50 transition-transform duration-400 group-hover/trigger:rotate-180">
          expand_more
        </span>
      </button>

      <!-- ── Drop Panel ── -->
      <div
        class="absolute top-[calc(100%+10px)] w-72
               ltr:left-0 rtl:right-0
               bg-white
               rounded-[28px]
               shadow-[0_12px_48px_rgba(0,0,0,0.18)]
               border border-outline-variant/20
               py-5 px-3
               opacity-0 invisible translate-y-3
               group-hover/trigger:opacity-100 group-hover/trigger:visible group-hover/trigger:translate-y-0
               transition-all duration-300 ease-out
               z-[200]">

        <!-- thin top accent bar -->
        <div class="absolute inset-x-6 top-0 h-[3px] rounded-b-full bg-gradient-to-r from-transparent via-primary/60 to-transparent"></div>

        <app-category-tree
          [categories]="categories()"
          [selectedId]="selectedCategoryId()"
          (categorySelected)="onCategorySelected($event)">
        </app-category-tree>
      </div>
    </div>
  `
})
export class CategoryDropdownComponent {
  categories = input<Category[]>([]);
  private lang = inject(LanguageService);
  private router = inject(Router);

  currentLanguage = this.lang.currentLanguage;
  selectedCategoryId = signal('');

  onCategorySelected(id: string): void {
    this.selectedCategoryId.set(id);
    const lang = this.currentLanguage();
    const params = id ? { categoryId: id } : {};
    this.router.navigate([`/${lang}/products`], { queryParams: params });
  }
}
