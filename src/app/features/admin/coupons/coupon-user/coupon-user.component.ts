import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CouponService } from '../../../../core/services/coupon.service';
import { UserService } from '../../../../core/services/user.service';
import { LanguageService } from '../../../../core/services/language.service';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { UserProfile } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-coupon-user',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, FormsModule],
  template: `
    <main class="min-h-screen bg-surface pb-24" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Hero Header -->
      <header class="bg-surface-container-low pt-24 pb-12 md:pb-16 border-b border-outline-variant/30 relative overflow-hidden">
        <div class="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--primary)_0%,_transparent_70%)]"></div>
        <div class="max-w-4xl mx-auto px-6 relative z-10 text-center">
           <div class="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
              <span class="material-symbols-outlined text-3xl text-primary">person_add</span>
           </div>
           <h1 class="font-headline text-4xl md:text-5xl font-black tracking-tighter text-on-surface mb-2">
             {{ 'admin.coupons.userAssignments' | translate }}
           </h1>
           <p class="font-body text-sm md:text-base text-on-surface-variant opacity-70">{{ 'admin.coupons.userAssignmentsSubtitle' | translate }}</p>
        </div>
      </header>

      <div class="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16 animate-slide-up">
        <div class="bg-surface-container-lowest rounded-[48px] shadow-2xl border border-outline-variant/10 overflow-hidden">
          @if (loading()) {
            <div class="flex flex-col items-center justify-center py-40 gap-4">
               <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
               <p class="font-headline font-black text-xs uppercase tracking-widest text-outline">{{ 'admin.coupons.syncPermissions' | translate }}</p>
            </div>
          } @else {
            <div class="p-6 md:p-16 space-y-8 md:space-y-10">
              
              <div class="space-y-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
                  <div class="text-start">
                    <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">{{ 'admin.coupons.targetPersonnel' | translate }}</p>
                    <h3 class="font-headline font-black text-2xl text-on-surface leading-none">{{ 'admin.coupons.userAssignments' | translate }}</h3>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <!-- Bulk Action Card -->
                  <div class="p-6 bg-surface-container-low rounded-[32px] border border-outline-variant/10 flex flex-col gap-4 text-start group hover:border-primary/30 transition-all">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                        <span class="material-symbols-outlined">auto_fix_high</span>
                      </div>
                      <div>
                        <p class="text-xs font-bold text-on-surface">{{ 'admin.coupons.globalDistribution' | translate }}</p>
                        <p class="text-[9px] text-outline-variant font-medium">{{ 'admin.coupons.targetPersonnelSubtitle' | translate }}</p>
                      </div>
                    </div>
                    
                    <div class="flex gap-2">
                      <div class="flex-grow relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-outline opacity-40">LIMIT</span>
                        <input type="number" [(ngModel)]="bulkLimit" [placeholder]="'admin.coupons.bulkLimit' | translate" 
                               class="w-full bg-white/50 px-10 py-3 rounded-xl border border-transparent focus:border-primary/20 outline-none font-headline font-black text-xs text-on-surface transition-all">
                      </div>
                      <button (click)="assignToAll()" 
                              class="px-6 py-3 bg-on-surface text-surface rounded-xl font-headline font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-lg shadow-black/5">
                        {{ 'admin.coupons.apply' | translate }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Search -->
              <div class="relative group">
                <input type="text" [value]="searchQuery()" (input)="onSearchChange($event)" 
                       [placeholder]="'admin.coupons.locatePersonnel' | translate" 
                       class="w-full bg-surface-container-low px-8 py-6 rounded-[32px] border border-outline-variant/10 focus:border-primary/30 outline-none font-headline font-black text-lg text-on-surface transition-all placeholder:text-[10px] placeholder:tracking-widest placeholder:uppercase placeholder:opacity-30">
                <div class="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  @if (searching()) {
                    <div class="w-5 h-5 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  } @else {
                    <span class="material-symbols-outlined text-outline-variant group-focus-within:text-primary transition-all group-focus-within:scale-110">search_check</span>
                  }
                </div>
              </div>

              <!-- List -->
              <div class="bg-surface-container-low rounded-[32px] md:rounded-[40px] border border-outline-variant/10 overflow-hidden">
                <div class="max-h-[400px] md:max-h-[500px] overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 custom-scrollbar">
                  @if (users().length === 0 && !searching()) {
                    <div class="py-20 text-center flex flex-col items-center gap-4 opacity-40">
                       <span class="material-symbols-outlined text-5xl">group_off</span>
                       <p class="font-headline font-black text-[10px] uppercase tracking-[0.2em] text-outline">{{ 'admin.coupons.noPersonnel' | translate }}</p>
                    </div>
                  }

                  @for (user of users(); track user.id) {
                    <label class="flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-[20px] md:rounded-[24px] bg-surface-container-lowest border border-transparent hover:border-primary/20 group cursor-pointer transition-all duration-300">
                       <div class="relative flex items-center justify-center">
                          <input type="checkbox" 
                                 [checked]="isAssigned(user.id)" 
                                 (change)="toggleAssignment(user.id)"
                                 class="hidden peer">
                          <div class="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center shadow-sm">
                             <span class="material-symbols-outlined text-white text-xs md:text-sm scale-0 peer-checked:scale-100 transition-transform">check</span>
                          </div>
                       </div>
                       
                        <div class="flex-grow min-w-0 text-start">
                          <h4 class="font-headline font-black text-xs md:text-sm text-on-surface truncate group-hover:text-primary transition-colors">{{ user.fullName || user.email }}</h4>
                          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                             <span class="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-outline">{{ user.email }}</span>
                             <div class="hidden md:block w-1 h-1 rounded-full bg-outline-variant opacity-30"></div>
                             <span class="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-outline opacity-60">ID: {{ user.id.slice(0,8) }}</span>
                          </div>
                       </div>

                       @if (isAssigned(user.id)) {
                         <div class="flex flex-col items-end gap-1 animate-fade-in" (click)="$event.stopPropagation()">
                            <p class="text-[8px] font-black uppercase tracking-widest text-primary">{{ 'admin.coupons.usageLimit' | translate }}</p>
                            <input type="number" 
                                   [value]="getLimit(user.id)" 
                                   (input)="updateLimit(user.id, $event)"
                                   placeholder="∞"
                                   class="w-16 bg-surface-container-low px-2 py-1.5 rounded-lg border border-transparent focus:border-primary/20 outline-none font-headline font-black text-xs text-center text-on-surface">
                         </div>
                       }
                    </label>
                  }
                </div>
              </div>

              @if (error()) {
                <div class="p-6 bg-error/10 text-error rounded-3xl border border-error/20 flex items-start gap-4 animate-fade-in">
                   <span class="material-symbols-outlined">report</span>
                   <p class="text-xs font-black uppercase tracking-widest text-start">{{ error() }}</p>
                </div>
              }
              @if (success()) {
                <div class="p-6 bg-success/10 text-success rounded-3xl border border-success/20 flex items-start gap-4 animate-fade-in">
                   <span class="material-symbols-outlined">verified</span>
                   <p class="text-xs font-black uppercase tracking-widest text-start">{{ success() }}</p>
                </div>
              }

              <footer class="pt-8 md:pt-10 border-t border-outline-variant/10 flex flex-col sm:flex-row gap-4 md:gap-6">
                <button type="button" (click)="saveAssignments()" [disabled]="submitting()"
                        class="order-1 sm:order-2 flex-[2] py-5 md:py-6 bg-on-surface text-surface rounded-[24px] md:rounded-[32px] font-headline font-bold text-base md:text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group">
                   @if (submitting()) {
                     <span class="w-6 h-6 border-4 border-surface/30 border-t-white rounded-full animate-spin"></span>
                   } @else {
                     <span>{{ 'admin.coupons.authorizeAccess' | translate }}</span>
                     <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">security_update_good</span>
                   }
                </button>
                <a routerLink="/admin/coupons"
                   class="order-2 sm:order-1 flex-1 py-5 md:py-6 bg-surface-container rounded-[24px] md:rounded-[32px] font-headline font-bold text-[10px] uppercase tracking-widest text-outline hover:bg-surface-container-high transition-all text-center flex items-center justify-center">
                   {{ 'admin.coupons.cancel' | translate }}
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
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--primary-rgb), 0.1); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(var(--primary-rgb), 0.2); }
  `]
})
export class CouponUserComponent implements OnInit, OnDestroy {
  private couponService = inject(CouponService);
  private userService = inject(UserService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  Math = Math;
  couponId = signal<string | null>(null);
  users = signal<UserProfile[]>([]);
  originallyAssignedIds = signal<Set<string>>(new Set());
  currentlyAssignedIds = signal<Set<string>>(new Set());
  searchQuery = signal('');
  searching = signal(false);
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  bulkLimit = signal<number | null>(null);
  userLimits = signal<Map<string, number | null>>(new Map());
  totalCustomers = signal(0);
  totalAssigned = signal(0);

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  selectedCount = computed(() => this.currentlyAssignedIds().size);
  get currentLang(): string { return this.languageService.currentLanguage(); }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) { this.couponId.set(id); this.loadInitialData(id); }
      else { this.error.set("Invalid coupon identifier."); this.loading.set(false); }
    });

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400), distinctUntilChanged(),
      switchMap(term => { 
        this.searching.set(true); 
        return term.trim() ? this.userService.searchCustomers(term) : this.userService.getAllCustomers();
      })
    ).subscribe({
      next: (res: any) => { 
        if (res.success && res.data) {
          this.users.set(res.data || []);
        } else if (res.items) {
          this.users.set(res.items);
        }
        this.searching.set(false); 
      },
      error: () => this.searching.set(false)
    });
  }

  ngOnDestroy() { this.searchSubscription?.unsubscribe(); }

  loadInitialData(couponId: string) {
    this.loading.set(true);
    forkJoin({ 
      usersRes: this.userService.getAllCustomers(), 
      assignedRes: this.couponService.getCouponUsers(couponId) 
    }).subscribe({
      next: (resp: any) => {
        if (resp.usersRes.success && resp.usersRes.data) {
          this.users.set(resp.usersRes.data || []);
          this.totalCustomers.set(resp.usersRes.meta?.total || 0);
        } else if (resp.usersRes.items) {
          this.users.set(resp.usersRes.items);
          this.totalCustomers.set(resp.usersRes.items.length);
        }
        
        let assignedIds: string[] = [];
        const limitsMap = new Map<string, number | null>();

        if (resp.assignedRes.success && resp.assignedRes.data) {
          this.totalAssigned.set(resp.assignedRes.data.length);
          assignedIds = resp.assignedRes.data.map((u: any) => {
            if (u.usageLimit !== undefined) {
              limitsMap.set(u.customerId, u.usageLimit);
            }
            return u.customerId;
          });
        }
        
        const assignedSet = new Set<string>(assignedIds);
        this.originallyAssignedIds.set(new Set(assignedSet));
        this.currentlyAssignedIds.set(assignedSet);
        this.userLimits.set(limitsMap);
        this.loading.set(false);
      },
      error: () => { this.error.set('Personnel sync failed.'); this.loading.set(false); }
    });
  }

  getLimit(userId: string): number | string {
    return this.userLimits().get(userId) ?? '';
  }

  updateLimit(userId: string, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    const num = val === '' ? null : parseInt(val, 10);
    const next = new Map(this.userLimits());
    next.set(userId, num);
    this.userLimits.set(next);
  }

  onSearchChange(event: Event) { const term = (event.target as HTMLInputElement).value; this.searchQuery.set(term); this.searchSubject.next(term); }
  isAssigned(userId: string): boolean { return this.currentlyAssignedIds().has(userId); }
  toggleAssignment(userId: string) {
    const next = new Set(this.currentlyAssignedIds());
    const nextLimits = new Map(this.userLimits());
    if (next.has(userId)) {
      next.delete(userId);
      nextLimits.delete(userId);
    } else {
      next.add(userId);
      // Initialize with bulk limit if available
      if (this.bulkLimit()) nextLimits.set(userId, this.bulkLimit());
    }
    this.currentlyAssignedIds.set(next);
    this.userLimits.set(nextLimits);
  }

  assignToAll() {
    if (!confirm('Authorize this incentive for ALL personnel accounts?')) return;
    this.submitting.set(true); this.error.set(null);
    this.couponService.bulkAssign({ 
      couponId: this.couponId()!, 
      userIds: [], 
      usageLimit: this.bulkLimit() ?? undefined 
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.success.set('Global distribution complete.');
          setTimeout(() => this.router.navigate(['/admin/coupons']), 1000);
        } else {
          this.error.set(res.error?.message || 'Distribution failure.');
        }
        this.submitting.set(false);
      },
      error: () => { this.error.set('Distribution failure.'); this.submitting.set(false); }
    });
  }

  saveAssignments() {
    if (!this.couponId()) return;
    this.submitting.set(true); this.error.set(null); this.success.set(null);
    const original = this.originallyAssignedIds();
    const current = this.currentlyAssignedIds();
    const toAdd = Array.from(current).filter(id => !original.has(id));
    const toRemove = Array.from(original).filter(id => !current.has(id));

    const requests: any[] = [];
    toAdd.forEach(uid => {
      requests.push(this.couponService.assignToUser({ 
        couponId: this.couponId()!, 
        userId: uid,
        usageLimit: this.userLimits().get(uid) ?? undefined
      }));
    });
    
    // Check for updated limits on existing assignments
    const originalIds = this.originallyAssignedIds();
    const existing = Array.from(originalIds).filter(id => current.has(id));
    
    existing.forEach(uid => {
       const newLimit = this.userLimits().get(uid) ?? null;
       // Note: To properly detect changes, we'd need to store original limits too.
       // For now, we'll just send the update request for all existing ones to be sure,
       // or we can just send it and the backend will handle it.
       requests.push(this.couponService.assignToUser({ 
         couponId: this.couponId()!, 
         userId: uid,
         usageLimit: newLimit ?? undefined
       }));
    });

    toRemove.forEach(uid => requests.push(this.couponService.removeFromUser(this.couponId()!, uid)));

    if (requests.length === 0) { this.submitting.set(false); this.router.navigate(['/admin/coupons']); return; }

    forkJoin(requests).subscribe({
      next: (responses) => {
        const failed = responses.some((r: any) => !r.success);
        if (!failed) {
          this.success.set('Permissions updated.');
          setTimeout(() => this.router.navigate(['/admin/coupons']), 1000);
        } else {
          this.error.set('Some assignments failed to synchronize.');
        }
        this.submitting.set(false);
      },
      error: () => { this.error.set('Synchronization failure.'); this.submitting.set(false); }
    });
  }
}

