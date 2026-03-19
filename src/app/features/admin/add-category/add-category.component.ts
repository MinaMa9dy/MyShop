import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CategoryService } from '../../../core/services/category.service';
import { LanguageService } from '../../../core/services/language.service';
import { AddCategoryDto, Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="add-category-page py-12 bg-gray-50 min-h-screen">
      <div class="container mx-auto px-4 max-w-2xl">
        <!-- Back Link -->
        <a [routerLink]="['/' + currentLang + '/categories']" 
           class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-8 group transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {{ 'common.backToProducts' | translate }}
        </a>

        <div class="card p-8 shadow-xl border-0 rounded-2xl bg-white">
          <div class="text-center mb-10">
            <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
              📁
            </div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ 'admin.addCategory.title' | translate }}</h1>
            <p class="text-gray-500">{{ 'admin.addProduct.subtitle' | translate }}</p>
          </div>

          <!-- Alert Messages -->
          @if (error()) {
            <div class="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-start animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span>{{ error() }}</span>
            </div>
          }

          @if (success()) {
            <div class="mb-8 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg flex items-start animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>{{ success() }}</span>
            </div>
          }

          <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Name -->
            <div class="form-group">
              <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">{{ 'admin.addCategory.name' | translate }} *</label>
              <input 
                type="text" 
                id="name" 
                formControlName="name" 
                placeholder="{{ 'admin.addCategory.namePlaceholder' | translate }}"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                [class.border-red-500]="categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched"
              >
              @if (categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched) {
                <p class="mt-1.5 text-xs text-red-500 flex items-center">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                     <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                   </svg>
                   Name is required
                </p>
              }
            </div>

            <!-- Super Category -->
            <div class="form-group">
              <label for="superCategoryId" class="block text-sm font-semibold text-gray-700 mb-2">{{ 'admin.addCategory.superCategory' | translate }}</label>
              <select 
                id="superCategoryId" 
                formControlName="superCategoryId"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none bg-white"
              >
                <option value="">{{ 'admin.addCategory.selectSuperCategory' | translate }}</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label for="description" class="block text-sm font-semibold text-gray-700 mb-2">{{ 'admin.addCategory.description' | translate }}</label>
              <textarea 
                id="description" 
                formControlName="description" 
                rows="4"
                placeholder="{{ 'admin.addCategory.descriptionPlaceholder' | translate }}"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
              ></textarea>
            </div>

            <!-- Submit Buttons -->
            <div class="flex gap-4 pt-4">
              <button 
                type="button" 
                [routerLink]="['/' + currentLang + '/categories']"
                class="flex-1 py-4 px-6 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95">
                {{ 'admin.addProduct.cancel' | translate }}
              </button>
              <button 
                type="submit" 
                [disabled]="categoryForm.invalid || submitting()"
                class="flex-1 py-4 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center">
                @if (submitting()) {
                  <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {{ 'admin.addProduct.adding' | translate }}
                } @else {
                  {{ 'admin.addCategory.button' | translate }}
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AddCategoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    superCategoryId: ['']
  });

  categories = signal<Category[]>([]);
  submitting = signal(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);

  get currentLang(): string {
    return this.languageService.currentLanguage();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => {
        this.categories.set(cats);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.success.set(null);
    this.error.set(null);

    const categoryData: AddCategoryDto = {
      name: this.categoryForm.value.name,
      description: this.categoryForm.value.description,
      superCategoryId: this.categoryForm.value.superCategoryId || undefined
    };

    this.categoryService.create(categoryData).subscribe({
      next: (response) => {
        console.log('Category added successfully:', response);
        this.submitting.set(false);
        this.success.set('Category added successfully!');
        
        // Reset form
        this.categoryForm.reset();
        
        // Redirect after a short delay
        setTimeout(() => {
          this.router.navigate(['/', this.currentLang, 'categories']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error adding category:', err);
        this.submitting.set(false);
        this.error.set(err.error?.message || err.error?.error || 'Failed to add category. Please try again.');
      }
    });
  }
}
