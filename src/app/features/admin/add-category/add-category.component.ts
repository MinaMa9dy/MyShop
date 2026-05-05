import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../../../core/services/category.service';
import { LanguageService } from '../../../core/services/language.service';
import { AddCategoryDto, Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <main class="min-h-screen bg-surface pb-24" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Hero Header -->
      <header class="bg-surface-container-low pt-24 pb-16 border-b border-outline-variant/30 overflow-hidden relative">
        <div class="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tertiary)_0%,_transparent_70%)]"></div>
        <div class="max-w-3xl mx-auto px-6 relative z-10 text-center">
           <div class="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
              <span class="material-symbols-outlined text-3xl text-primary">category</span>
           </div>
           <h1 class="font-headline text-5xl font-black tracking-tighter text-on-surface mb-2">
             {{ 'admin.addCategory.title' | translate }}
           </h1>
           <p class="font-body text-on-surface-variant opacity-70">
             {{ 'admin.addCategory.subtitle' | translate }}
           </p>
        </div>
      </header>

      <div class="max-w-2xl mx-auto px-6 py-16 animate-slide-up">
        <div class="bg-surface-container-lowest rounded-[48px] shadow-2xl border border-outline-variant/10 overflow-hidden">
          <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="p-10 md:p-16 space-y-10">
            
            <div class="space-y-3">
              <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'admin.addCategory.name' | translate }} *</label>
              <input type="text" formControlName="name" 
                     [placeholder]="'admin.addCategory.namePlaceholder' | translate"
                     class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all">
              @if (categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched) {
                <p class="text-[10px] font-black text-error uppercase px-2">{{ 'admin.addCategory.nameRequired' | translate }}</p>
              }
            </div>

            <div class="space-y-3">
              <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'admin.addCategory.superCategory' | translate }}</label>
              <div class="relative group">
                <select formControlName="superCategoryId"
                        class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all appearance-none cursor-pointer">
                  <option value="">{{ 'admin.addCategory.selectSuperCategory' | translate }}</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
                <span class="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:rotate-180 transition-transform">expand_more</span>
              </div>
            </div>

            <div class="space-y-3">
              <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'admin.addCategory.description' | translate }}</label>
              <textarea formControlName="description" rows="5"
                        [placeholder]="'admin.addCategory.descriptionPlaceholder' | translate"
                        class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all resize-none"></textarea>
            </div>

            @if (error()) {
              <div class="p-6 bg-error/10 text-error rounded-3xl border border-error/20 flex items-start gap-4">
                 <span class="material-symbols-outlined">report</span>
                 <p class="text-xs font-black uppercase tracking-widest">{{ error() }}</p>
              </div>
            }
            @if (success()) {
              <div class="p-6 bg-success/10 text-success rounded-3xl border border-success/20 flex items-start gap-4">
                 <span class="material-symbols-outlined">check_circle</span>
                 <p class="text-xs font-black uppercase tracking-widest">{{ success() }}</p>
              </div>
            }

            <div class="flex flex-col sm:flex-row gap-6 pt-4">
              <button type="submit" [disabled]="categoryForm.invalid || submitting()"
                      class="flex-[2] py-6 bg-primary text-on-primary rounded-[32px] font-headline font-bold text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group">
                 @if (submitting()) {
                   <span class="w-6 h-6 border-4 border-on-primary/30 border-t-white rounded-full animate-spin"></span>
                 } @else {
                   <span>{{ 'admin.addCategory.button' | translate }}</span>
                   <span class="material-symbols-outlined group-hover:translate-y-1 transition-transform">schema</span>
                 }
              </button>
              <a [routerLink]="['/' + currentLang + '/categories']"
                 class="flex-1 py-6 bg-surface-container rounded-[32px] font-headline font-bold text-xs uppercase tracking-widest text-outline hover:bg-surface-container-high transition-all text-center flex items-center justify-center">
                 {{ 'admin.addCategory.cancel' | translate }}
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  `,
  styles: []
})
export class AddCategoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    superCategoryId: ['']
  });

  categories = signal<Category[]>([]);
  submitting = signal(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);

  get currentLang(): string { return this.languageService.currentLanguage(); }

  ngOnInit(): void { this.loadCategories(); }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => this.error.set(this.translate.instant('admin.addCategory.error'))
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) { this.categoryForm.markAllAsTouched(); return; }
    this.submitting.set(true); this.success.set(null); this.error.set(null);

    const categoryData: AddCategoryDto = {
      name: this.categoryForm.value.name,
      description: this.categoryForm.value.description,
      superCategoryId: this.categoryForm.value.superCategoryId || undefined
    };

    this.categoryService.create(categoryData).subscribe({
      next: () => {
        this.submitting.set(false); this.success.set(this.translate.instant('admin.addCategory.success'));
        this.categoryForm.reset();
        setTimeout(() => this.router.navigate(['/', this.currentLang, 'categories']), 1000);
      },
      error: (err) => { this.submitting.set(false); this.error.set(err.error?.message || this.translate.instant('admin.addCategory.error')); }
    });
  }
}
