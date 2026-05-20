import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { LanguageService } from '../../../core/services/language.service';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="categories-page min-h-screen bg-surface" dir="rtl">

      <!-- ── Page Header ── -->
      <div class="px-4 md:px-6 pt-5 pb-3 max-w-[1400px] mx-auto flex items-center justify-between">
        <h1 class="font-black text-on-surface text-xl md:text-2xl" style="font-family:'Cairo',sans-serif;">
          التصنيفات
        </h1>
        @if (isAdmin()) {
          <a routerLink="/admin/categories/add"
             class="flex items-center gap-1.5 bg-primary text-white rounded-full px-4 py-2 text-sm font-bold no-underline hover:bg-primary-dim transition-all"
             style="font-family:'Cairo',sans-serif;">
            <span class="material-symbols-outlined text-[18px]">add</span>
            إضافة تصنيف
          </a>
        }
      </div>

      <!-- ── Loading Skeleton Grid ── -->
      @if (loading()) {
        <div class="px-4 md:px-6 lg:px-10 pb-10 max-w-[1400px] mx-auto pt-2 md:pt-4">
          <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            @for (i of [1,2,3,4,5,6,7,8,9,10,11,12]; track i) {
              <div class="flex flex-col items-center gap-2 w-full">
                <div class="skeleton w-full aspect-square max-w-[96px] rounded-2xl mx-auto"></div>
                <div class="skeleton h-3 w-14 rounded-lg"></div>
              </div>
            }
          </div>
        </div>
      }

      <!-- ── Empty State ── -->
      @else if (categories().length === 0) {
        <div class="flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
          <div class="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
            <span class="material-symbols-outlined text-4xl text-outline-variant">category</span>
          </div>
          <p class="font-black text-on-surface" style="font-family:'Cairo',sans-serif;">لا توجد تصنيفات</p>
        </div>
      }

      <!-- ── CATEGORIES GRID ── -->
      @else {
        <div class="px-4 md:px-6 lg:px-10 pb-10 max-w-[1400px] mx-auto pt-2 md:pt-4">
          <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            @for (category of categories(); track category.id) {
              <a routerLink="/products"
                 [queryParams]="{categoryId: category.id}"
                 class="flex flex-col items-center gap-2 no-underline group w-full">
                <!-- Icon Box -->
                <div class="w-full aspect-square max-w-[96px] rounded-2xl bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center
                            group-hover:border-primary/40 group-hover:bg-primary/5 group-active:scale-95
                            transition-all duration-300 mx-auto"
                     style="box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  <span class="material-symbols-outlined text-3xl md:text-4xl text-primary transition-transform duration-300 group-hover:scale-110">
                    {{ getCategoryIcon(category.name) }}
                  </span>
                </div>
                <!-- Label -->
                <span class="text-xs md:text-sm text-center text-on-surface font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors"
                      style="font-family:'Cairo',sans-serif;">
                  {{ category.name }}
                </span>
                @if (category.productsCount) {
                  <span class="text-[10px] text-on-surface-variant" style="font-family:'Tajawal',sans-serif;">
                    {{ category.productsCount }} منتج
                  </span>
                }
              </a>
            }
          </div>
        </div>
      }

    </main>
  `,
  styles: [`
    :host { display: block; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `]
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
    const n = (name || '').toLowerCase();
    if (n.includes('مشروب') || n.includes('drink') || n.includes('beverage') || n.includes('snack') || n.includes('سناكس')) return 'local_cafe';
    if (n.includes('معلب') || n.includes('can') || n.includes('canned')) return 'inventory_2';
    if (n.includes('حلو') || n.includes('sweet') || n.includes('candy')) return 'cake';
    if (n.includes('مكرون') || n.includes('pasta') || n.includes('أرز') || n.includes('rice')) return 'rice_bowl';
    if (n.includes('منظف') || n.includes('clean') || n.includes('soap')) return 'cleaning_services';
    if (n.includes('خضار') || n.includes('vegetable')) return 'eco';
    if (n.includes('لحم') || n.includes('meat')) return 'kebab_dining';
    if (n.includes('خبز') || n.includes('bread') || n.includes('bakery')) return 'breakfast_dining';
    if (n.includes('لبان') || n.includes('لبن') || n.includes('أجبان') || n.includes('cheese') || n.includes('dairy') || n.includes('ألبان')) return 'set_meal';
    if (n.includes('frozen') || n.includes('مجمد')) return 'ac_unit';
    if (n.includes('بقال') || n.includes('grocery')) return 'shopping_basket';
    return 'category';
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: (response: any) => {
        let cats: any[] = [];
        if (Array.isArray(response)) cats = response;
        else if (response?.data && Array.isArray(response.data)) cats = response.data;
        else if (response?.items) cats = response.items;
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loading.set(false);
      }
    });
  }
}
