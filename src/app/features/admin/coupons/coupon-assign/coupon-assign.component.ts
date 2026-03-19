import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CouponService } from '../../../../core/services/coupon.service';
import { ProductService } from '../../../../core/services/product.service';
import { LanguageService } from '../../../../core/services/language.service';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-coupon-assign',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="coupon-assign-page py-12 bg-gray-50 min-h-screen">
      <div class="container mx-auto px-4 max-w-4xl">
        <!-- Back Link -->
        <a [routerLink]="['/' + currentLang + '/admin/coupons']" 
           class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-8 group transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Coupons
        </a>

        <div class="card p-8 shadow-xl border-0 rounded-2xl bg-white">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
              🔗
            </div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ 'admin.coupons.assignTitle' | translate }}</h1>
            <p class="text-gray-500">{{ 'admin.coupons.assignSubtitle' | translate }}</p>
          </div>

          <!-- Alert Messages -->
          @if (error()) {
            <div class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-start animate-fade-in">
              <span class="mr-2">⚠️</span>
              <span>{{ error() }}</span>
            </div>
          }
          
          @if (success()) {
            <div class="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg flex items-start animate-fade-in">
              <span class="mr-2">✓</span>
              <span>{{ success() }}</span>
            </div>
          }

          @if (loading()) {
            <div class="flex justify-center py-12">
              <div class="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          } @else {
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex justify-between items-center">
              <div>
                <h3 class="font-semibold text-gray-800">Assign Products</h3>
                <p class="text-sm text-gray-500">Select the products that are eligible for this coupon.</p>
              </div>
              <div class="text-sm font-medium px-3 py-1 bg-purple-100 text-purple-800 rounded-lg">
                {{ selectedCount() }} Selected
              </div>
            </div>

            <!-- Search Details -->
            <div class="mb-4 relative">
              <input type="text" [value]="searchQuery()" (input)="onSearchChange($event)" placeholder="Search products (Backend filter)..." 
                     class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none">
              @if (searching()) {
                <div class="absolute right-4 top-1/2 -translate-y-1/2">
                  <div class="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              }
            </div>

            <div class="border border-gray-200 rounded-xl overflow-hidden mb-8">
              <div class="max-h-96 overflow-y-auto p-2 space-y-1 bg-white">
                @if (products().length === 0 && !searching()) {
                  <div class="p-8 text-center text-gray-500 italic">No products found matching your search.</div>
                }

                @for (product of products(); track (product.id || product.Id)) {
                  <label class="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                    <input type="checkbox" 
                           [checked]="isAssigned(product.id || product.Id)" 
                           (change)="toggleAssignment(product.id || product.Id)"
                           class="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer">
                    <div class="ml-4 flex-1">
                      <div class="font-medium text-gray-800">{{ product.name || product.Name }}</div>
                      <div class="text-sm text-gray-500">{{ (product.newPrice || product.NewPrice || product.price) | currency:'EGP ' }}</div>
                    </div>
                  </label>
                }
              </div>
            </div>

            <!-- Submit Buttons -->
            <div class="flex gap-4 pt-4 border-t border-gray-100">
              <button type="button" [routerLink]="['/' + currentLang + '/admin/coupons']"
                class="flex-1 py-4 px-6 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95">
                Cancel
              </button>
              <button type="button" (click)="saveAssignments()" [disabled]="submitting()"
                class="flex-1 py-4 px-6 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/20 active:scale-95 flex items-center justify-center">
                @if (submitting()) {
                  <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {{ 'admin.coupons.assigning' | translate }}
                } @else {
                  {{ 'admin.coupons.assignButton' | translate }}
                }
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class CouponAssignComponent implements OnInit, OnDestroy {
  private couponService = inject(CouponService);
  private productService = inject(ProductService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  couponCode = signal<string | null>(null);
  products = signal<any[]>([]);
  originallyAssignedIds = signal<Set<string>>(new Set());
  currentlyAssignedIds = signal<Set<string>>(new Set());
  
  searchQuery = signal('');
  searching = signal(false);
  
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  selectedCount = computed(() => this.currentlyAssignedIds().size);

  get currentLang(): string {
    return this.languageService.currentLanguage();
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.couponCode.set(id);
        this.loadInitialData(id);
      } else {
        this.error.set("Invalid coupon ID");
        this.loading.set(false);
      }
    });

    // Setup debounced backend search
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(term => {
        this.searching.set(true);
        return this.productService.getFiltered({ searchTerm: term, pageSize: 50 });
      })
    ).subscribe({
      next: (response) => {
        this.handleProductResponse(response);
        this.searching.set(false);
      },
      error: (err) => {
        console.error('Search error', err);
        this.searching.set(false);
      }
    });
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  loadInitialData(couponCode: string) {
    this.loading.set(true);
    
    // Initial load: get products (unfiltered) and current assignments
    const getProductsReq = this.productService.getFiltered({ pageSize: 50 });
    const getAssignedReq = this.couponService.getAssignedProducts(couponCode);

    forkJoin({
      productsRaw: getProductsReq,
      assignedIds: getAssignedReq
    }).subscribe({
      next: (responses) => {
        this.handleProductResponse(responses.productsRaw);
        
        // Extract IDs from the assigned products (new backend returns full DTOs)
        const assignedIds = (responses.assignedIds || []).map((p: any) => p.id || p.Id || p);
        const assignedSet = new Set<string>(assignedIds);
        
        this.originallyAssignedIds.set(new Set(assignedSet)); // Keep a copy of original for diffing
        this.currentlyAssignedIds.set(assignedSet);
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading data', err);
        this.error.set('Failed to load products or existing assignments.');
        this.loading.set(false);
      }
    });
  }

  private handleProductResponse(response: any) {
    let productList: any[] = [];
    if (!response) {
      this.products.set([]);
      return;
    }

    if (Array.isArray(response)) {
      productList = response;
    } else if (typeof response === 'object') {
      // Check common property names including the one used in ListOfProductsWithCountDto
      if (Array.isArray(response.getProducts)) {
        productList = response.getProducts;
      } else if (Array.isArray(response.GetProducts)) {
        productList = response.GetProducts;
      } else if (Array.isArray(response.items)) {
        productList = response.items;
      } else if (Array.isArray(response.data)) {
        productList = response.data;
      } else if (Array.isArray(response.result)) {
        productList = response.result;
      } else {
        // Fallback: search for any array property if the above fail
        const arrayProp = Object.keys(response).find(key => Array.isArray(response[key]));
        if (arrayProp) {
          productList = response[arrayProp];
        }
      }
    }
    
    this.products.set(productList);
  }

  onSearchChange(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchQuery.set(term);
    this.searchSubject.next(term);
  }

  isAssigned(productId: string): boolean {
    return this.currentlyAssignedIds().has(productId);
  }

  toggleAssignment(productId: string) {
    const newSet = new Set(this.currentlyAssignedIds());
    if (newSet.has(productId)) {
      newSet.delete(productId);
    } else {
      newSet.add(productId);
    }
    this.currentlyAssignedIds.set(newSet);
  }

  saveAssignments() {
    if (!this.couponCode()) return;
    
    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);

    // Calculate diffs to minimize backend calls
    const original = this.originallyAssignedIds();
    const current = this.currentlyAssignedIds();

    const idsToAdd = Array.from(current).filter(id => !original.has(id));
    const idsToRemove = Array.from(original).filter(id => !current.has(id));

    // Optimistically say no changes if arrays are empty
    if (idsToAdd.length === 0 && idsToRemove.length === 0) {
      this.submitting.set(false);
      this.router.navigate(['/', this.currentLang, 'admin', 'coupons']);
      return;
    }

    // Prepare requests based on diffs
    const requests: any = {};
    if (idsToAdd.length > 0) {
      requests.add = this.couponService.assignProducts(this.couponCode()!, idsToAdd);
    }
    if (idsToRemove.length > 0) {
      requests.remove = this.couponService.removeProducts(this.couponCode()!, idsToRemove);
    }

    // Execute needed requests
    forkJoin(requests).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set('Assignments updated successfully!');
        
        setTimeout(() => {
          this.router.navigate(['/', this.currentLang, 'admin', 'coupons']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error saving assignments', err);
        this.submitting.set(false);
        this.error.set('Failed to save product assignments. Please try again.');
      }
    });
  }
}
