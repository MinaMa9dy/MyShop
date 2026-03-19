import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CategoryService } from '../../../core/services/category.service';
import { LanguageService } from '../../../core/services/language.service';
import { Category } from '../../../core/models/category.model';
import { TokenService } from '../../../core/services/token.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="categories-page py-8">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">{{ 'nav.categories' | translate }}</h1>
          @if (isAdmin()) {
            <button 
              [routerLink]="['/' + currentLang + '/admin/categories/add']"
              class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/20 transform hover:-translate-y-0.5 active:translate-y-0 text-sm md:text-base">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="font-bold">{{ 'admin.addCategory.button' | translate }}</span>
            </button>
          }
        </div>
        
        @if (loading()) {
          <div class="flex justify-center py-12">
            <div class="loading-spinner"></div>
          </div>
        } @else if (categories().length === 0) {
          <div class="card text-center py-12">
            <p class="text-gray-500">No categories available</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            @for (category of categories(); track category.id) {
              <a [routerLink]="['/' + currentLang + '/products']" 
                 [queryParams]="{categoryId: category.id}"
                 class="category-card card hover:shadow-lg transition-all cursor-pointer group">
                <div class="category-icon w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center text-3xl group-hover:bg-blue-100 transition-colors">
                  📁
                </div>
                <h3 class="font-semibold text-lg text-center mb-2 group-hover:text-blue-600 transition-colors">
                  {{ category.name }}
                </h3>
                @if (category.description) {
                  <p class="text-gray-500 text-sm text-center mb-3 line-clamp-2">
                    {{ category.description }}
                  </p>
                }
                <div class="text-center">
                  <span class="text-sm text-gray-400">
                    {{ category.productsCount || 0 }} {{ 'nav.products' | translate }}
                  </span>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private languageService = inject(LanguageService);
  private tokenService = inject(TokenService);
  
  categories = signal<any[]>([]);
  loading = signal(false);
  
  isAdmin = computed(() => this.tokenService.hasRole('Admin'));
  
  get currentLang(): string {
    return this.languageService.currentLanguage();
  }
  
  ngOnInit(): void {
    this.loadCategories();
  }
  
  loadCategories(): void {
    this.loading.set(true);
    
    this.categoryService.getAll().subscribe({
      next: (response: any) => {
        console.log('Categories API Response:', response);
        let cats: any[] = [];
        if (Array.isArray(response)) {
          cats = response;
        } else if (response && Array.isArray(response.data)) {
          cats = response.data;
        } else if (response && response.items) {
          cats = response.items;
        }
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading.set(false);
      }
    });
  }
}

