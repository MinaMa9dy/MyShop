import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CategoryService } from '../../../core/services/category.service';
import { LanguageService } from '../../../core/services/language.service';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <main class="categories-page min-h-screen bg-surface">
      <!-- Category Hero -->
      <section class="bg-surface-container-low py-16 md:py-24 border-b border-outline-variant/30">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex flex-col md:flex-row justify-between items-center gap-8">
            <div class="max-w-2xl text-start">
              <h1 class="font-headline text-5xl md:text-6xl font-black tracking-tighter text-on-surface mb-6">
                {{ 'nav.categories' | translate }}
              </h1>

            </div>
            
            @if (isAdmin()) {
              <button 
                [routerLink]="['/' + currentLang + '/admin/categories/add']"
                class="flex items-center gap-3 px-8 py-4 bg-primary text-on-primary rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl font-headline font-bold">
                <span class="material-symbols-outlined">add_circle</span>
                {{ 'admin.addCategory.button' | translate }}
              </button>
            }
          </div>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-6 py-20">
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-40 gap-4">
             <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
             <p class="font-headline font-bold text-outline uppercase tracking-widest text-xs">Syncing Catalog</p>
          </div>
        } @else if (categories().length === 0) {
          <div class="text-center py-40 bg-surface-container-lowest rounded-3xl border-2 border-dashed border-outline-variant/30">
             <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">inventory_2</span>
             <p class="font-headline font-bold text-on-surface-variant">No categories discovered in this sector</p>
          </div>
        } @else {
          <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            @for (category of categories(); track category.id) {
              <a [routerLink]="['/' + currentLang + '/products']" 
                 [queryParams]="{categoryId: category.id}"
                 class="group relative bg-surface-container-lowest rounded-2xl md:rounded-3xl p-4 md:p-8 border border-outline-variant/10 hover:border-primary/30 hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] transition-all duration-500 overflow-hidden flex flex-col items-center justify-center text-center">
                
                <!-- Background Glow -->
                <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div class="w-14 h-14 md:w-24 md:h-24 rounded-full bg-surface-container flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-on-primary transition-all duration-500 shadow-sm relative z-10">
                   <span class="material-symbols-outlined text-3xl md:text-5xl">{{ getCategoryIcon(category.name) }}</span>
                </div>

                <div class="relative z-10 transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 class="font-headline text-lg md:text-2xl font-extrabold tracking-tight text-on-surface mb-1 md:mb-2 line-clamp-1">
                    {{ category.name }}
                  </h3>
                  
                  @if (category.description) {
                    <p class="hidden md:block text-on-surface-variant text-sm font-body line-clamp-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {{ category.description }}
                    </p>
                  }
                  
                  <div class="mt-2 md:mt-6 flex flex-col items-center gap-2 md:gap-3">
                     <span class="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-outline group-hover:text-primary transition-colors">
                        {{ category.productsCount || 0 }} {{ 'nav.products' | translate }}
                     </span>
                     <div class="hidden md:block w-12 h-1 bg-outline-variant/30 rounded-full overflow-hidden group-hover:w-20 transition-all duration-500">
                        <div class="w-full h-full bg-primary -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                     </div>
                  </div>
                </div>

                <!-- Decorative corner icon -->
                <span class="material-symbols-outlined absolute top-4 right-4 md:top-6 md:right-6 text-outline-variant opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500 text-sm md:text-base">arrow_outward</span>
              </a>
            }
          </div>
        }
      </section>
    </main>
  `,
  styles: []
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
  
  getCategoryIcon(name: string): string {
    const iconMap: { [key: string]: string } = {
       'Electronics': 'devices',
       'Phones': 'smartphone',
       'Computers': 'laptop_mac',
       'Home': 'home',
       'Fashion': 'apparel',
       'Beauty': 'content_cut',
       'Sports': 'sports_basketball',
       'Toys': 'toys',
       'Grocery': 'shopping_basket',
       'Health': 'health_and_safety',
       'Automotive': 'directions_car',
       'Books': 'menu_book'
    };
    return iconMap[name] || 'inventory_2';
 }

  ngOnInit(): void {
    this.loadCategories();
  }
  
  loadCategories(): void {
    this.loading.set(true);
    
    this.categoryService.getAll().subscribe({
      next: (response: any) => {
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
