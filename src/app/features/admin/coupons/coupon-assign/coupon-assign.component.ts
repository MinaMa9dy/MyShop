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
    <main class="min-h-screen bg-surface pb-24" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Hero Header -->
      <header class="bg-surface-container-low pt-24 pb-16 border-b border-outline-variant/30 relative overflow-hidden">
        <div class="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tertiary)_0%,_transparent_70%)]"></div>
        <div class="max-w-4xl mx-auto px-6 relative z-10 text-center">
           <div class="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
              <span class="material-symbols-outlined text-3xl text-tertiary">link</span>
           </div>
           <h1 class="font-headline text-5xl font-black tracking-tighter text-on-surface mb-2">
             {{ 'admin.coupons.assignTitle' | translate }}
           </h1>
           <p class="font-body text-on-surface-variant opacity-70">Associate specific inventory entities with this incentive protocol.</p>
        </div>
      </header>

      <div class="max-w-4xl mx-auto px-6 py-16 animate-slide-up">
        <div class="bg-surface-container-lowest rounded-[48px] shadow-2xl border border-outline-variant/10 overflow-hidden">
          @if (loading()) {
            <div class="flex flex-col items-center justify-center py-40 gap-4">
               <div class="w-12 h-12 border-4 border-tertiary/20 border-t-tertiary rounded-full animate-spin"></div>
               <p class="font-headline font-black text-xs uppercase tracking-widest text-outline">Mapping Associations</p>
            </div>
          } @else {
            <div class="p-10 md:p-16 space-y-10 focus-within:bg-surface-container-lowest transition-colors">
              
              <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-tertiary/5 rounded-[32px] border border-tertiary/10">
                <div>
                   <h3 class="font-headline font-black text-xl text-on-surface">Entity Selection</h3>
                   <p class="text-xs font-black uppercase tracking-widest text-outline opacity-60">Authorize specific products for protocol eligibility.</p>
                </div>
                <div class="px-6 py-3 bg-tertiary text-on-tertiary rounded-2xl font-headline font-black text-xs uppercase tracking-widest shadow-lg shadow-tertiary/20">
                  {{ selectedCount() }} Bound Entities
                </div>
              </div>

              <!-- Search Detail -->
              <div class="relative group">
                <input type="text" [value]="searchQuery()" (input)="onSearchChange($event)" 
                       placeholder="Scan Inventory Log (Term)..." 
                       class="w-full bg-surface-container-low px-8 py-6 rounded-[32px] border-2 border-transparent focus:border-tertiary/20 outline-none font-headline font-black text-lg text-on-surface transition-all placeholder:font-body placeholder:text-sm placeholder:tracking-widest placeholder:uppercase placeholder:opacity-30">
                <div class="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  @if (searching()) {
                    <div class="w-6 h-6 border-4 border-tertiary/20 border-t-tertiary rounded-full animate-spin"></div>
                  } @else {
                    <span class="material-symbols-outlined text-outline-variant group-focus-within:text-tertiary transition-colors">search</span>
                  }
                </div>
              </div>

              <!-- Scrollable List -->
              <div class="bg-surface-container-low rounded-[40px] border border-outline-variant/10 overflow-hidden">
                <div class="max-h-[500px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  @if (products().length === 0 && !searching()) {
                    <div class="py-20 text-center flex flex-col items-center gap-4 opacity-40">
                       <span class="material-symbols-outlined text-5xl">inventory_2</span>
                       <p class="font-headline font-black text-xs uppercase tracking-[0.2em] text-outline">No matches discovered in current sector.</p>
                    </div>
                  }

                  @for (product of products(); track (product.id || product.Id)) {
                    <label class="flex items-center gap-6 p-6 rounded-[24px] bg-surface-container-lowest border border-transparent hover:border-tertiary/20 group cursor-pointer transition-all duration-300">
                       <div class="relative flex items-center justify-center">
                          <input type="checkbox" 
                                 [checked]="isAssigned(product.id || product.Id)" 
                                 (change)="toggleAssignment(product.id || product.Id)"
                                 class="hidden peer">
                          <div class="w-8 h-8 rounded-xl border-2 border-outline-variant peer-checked:border-tertiary peer-checked:bg-tertiary transition-all flex items-center justify-center shadow-sm">
                             <span class="material-symbols-outlined text-white text-sm scale-0 peer-checked:scale-100 transition-transform">check</span>
                          </div>
                       </div>
                       
                       <div class="flex-grow min-w-0">
                          <h4 class="font-headline font-black text-sm text-on-surface truncate group-hover:text-tertiary transition-colors">{{ product.name || product.Name }}</h4>
                          <div class="flex items-center gap-4 pt-1">
                             <span class="text-[10px] font-black uppercase tracking-widest text-outline">VALUATION: {{ (product.newPrice || product.NewPrice || product.price) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</span>
                             <div class="w-1 h-1 rounded-full bg-outline-variant opacity-30"></div>
                             <span class="text-[10px] font-black uppercase tracking-widest text-outline opacity-60">ID: {{ (product.id || product.Id).slice(0,8) }}</span>
                          </div>
                       </div>
                    </label>
                  }
                </div>
              </div>

              <!-- Status Feedbacks -->
              @if (error()) {
                <div class="p-6 bg-error/10 text-error rounded-3xl border border-error/20 flex items-start gap-4 animate-fade-in">
                   <span class="material-symbols-outlined">report</span>
                   <p class="text-xs font-black uppercase tracking-widest">{{ error() }}</p>
                </div>
              }
              @if (success()) {
                <div class="p-6 bg-success/10 text-success rounded-3xl border border-success/20 flex items-start gap-4 animate-fade-in">
                   <span class="material-symbols-outlined">verified</span>
                   <p class="text-xs font-black uppercase tracking-widest text-start">{{ success() }}</p>
                </div>
              }

              <!-- Master Controls -->
              <footer class="pt-10 border-t border-outline-variant/10 flex flex-col sm:flex-row gap-6">
                <button type="button" (click)="saveAssignments()" [disabled]="submitting()"
                        class="flex-[2] py-6 bg-on-surface text-surface rounded-[32px] font-headline font-bold text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group">
                   @if (submitting()) {
                     <span class="w-6 h-6 border-4 border-surface/30 border-t-white rounded-full animate-spin"></span>
                   } @else {
                     <span>Authorize Associations</span>
                     <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">rocket_launch</span>
                   }
                </button>
                <a [routerLink]="['/' + currentLang + '/admin/coupons']"
                   class="flex-1 py-6 bg-surface-container rounded-[32px] font-headline font-bold text-xs uppercase tracking-widest text-outline hover:bg-surface-container-high transition-all text-center flex items-center justify-center">
                   Terminate Protocol
                </a>
              </footer>
            </div>
          }
        </div>
      </div>
    </main>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--tertiary-rgb), 0.1); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(var(--tertiary-rgb), 0.2); }
  `]
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
  get currentLang(): string { return this.languageService.currentLanguage(); }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) { this.couponCode.set(id); this.loadInitialData(id); }
      else { this.error.set("Invalid coupon identifier."); this.loading.set(false); }
    });

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400), distinctUntilChanged(),
      switchMap(term => { this.searching.set(true); return this.productService.getFiltered({ searchTerm: term, pageSize: 50 }); })
    ).subscribe({
      next: (res) => { this.handleProductResponse(res); this.searching.set(false); },
      error: () => this.searching.set(false)
    });
  }

  ngOnDestroy() { this.searchSubscription?.unsubscribe(); }

  loadInitialData(couponCode: string) {
    this.loading.set(true);
    forkJoin({ productsRaw: this.productService.getFiltered({ pageSize: 50 }), assignedIds: this.couponService.getAssignedProducts(couponCode) }).subscribe({
      next: (resp) => {
        this.handleProductResponse(resp.productsRaw);
        const assignedIds = (resp.assignedIds || []).map((p: any) => p.id || p.Id || p);
        const assignedSet = new Set<string>(assignedIds);
        this.originallyAssignedIds.set(new Set(assignedSet));
        this.currentlyAssignedIds.set(assignedSet);
        this.loading.set(false);
      },
      error: () => { this.error.set('Data link synchronization failure.'); this.loading.set(false); }
    });
  }

  private handleProductResponse(response: any) {
    if (!response) { this.products.set([]); return; }
    let list = Array.isArray(response) ? response : (response.getProducts || response.GetProducts || response.items || response.data || response.result || []);
    if (!Array.isArray(list)) {
       const key = Object.keys(response).find(k => Array.isArray(response[k]));
       list = key ? response[key] : [];
    }
    this.products.set(list);
  }

  onSearchChange(event: Event) { const term = (event.target as HTMLInputElement).value; this.searchQuery.set(term); this.searchSubject.next(term); }
  isAssigned(productId: string): boolean { return this.currentlyAssignedIds().has(productId); }
  toggleAssignment(productId: string) {
    const next = new Set(this.currentlyAssignedIds());
    if (next.has(productId)) next.delete(productId); else next.add(productId);
    this.currentlyAssignedIds.set(next);
  }

  saveAssignments() {
    if (!this.couponCode()) return;
    this.submitting.set(true); this.error.set(null); this.success.set(null);
    const original = this.originallyAssignedIds();
    const current = this.currentlyAssignedIds();
    const toAdd = Array.from(current).filter(id => !original.has(id));
    const toRemove = Array.from(original).filter(id => !current.has(id));

    if (toAdd.length === 0 && toRemove.length === 0) {
      this.submitting.set(false); this.router.navigate(['/', this.currentLang, 'admin', 'coupons']); return;
    }

    const requests: any = {};
    if (toAdd.length > 0) requests.add = this.couponService.assignProducts(this.couponCode()!, toAdd);
    if (toRemove.length > 0) requests.remove = this.couponService.removeProducts(this.couponCode()!, toRemove);

    forkJoin(requests).subscribe({
      next: () => {
        this.submitting.set(false); this.success.set('Protocol associations verified.');
        setTimeout(() => this.router.navigate(['/', this.currentLang, 'admin', 'coupons']), 1000);
      },
      error: () => { this.submitting.set(false); this.error.set('Authorization update failure.'); }
    });
  }
}
