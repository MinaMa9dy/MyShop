import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="categories-page py-8">
      <div class="container mx-auto px-4">
        <h1 class="page-header">Categories</h1>
        
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
              <a [routerLink]="['/products']" 
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
  
  categories = signal<any[]>([]);
  loading = signal(false);
  
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

