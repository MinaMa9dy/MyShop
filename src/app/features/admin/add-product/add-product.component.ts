import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminProductService } from '../../../core/services/admin-product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="add-product-page min-h-screen bg-gray-50 py-8">
      <div class="max-w-2xl mx-auto px-4">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ 'admin.addProduct.title' | translate }}</h1>
          <p class="text-gray-500">{{ 'admin.addProduct.subtitle' | translate }}</p>
        </div>

        <!-- Loading Categories -->
        @if (loadingCategories()) {
          <div class="flex justify-center py-8">
            <div class="loading-spinner w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        } @else {
          <!-- Form Card -->
          <div class="card bg-white rounded-xl shadow-sm p-6">
            <form [formGroup]="productForm" (ngSubmit)="addProduct()">
              <!-- Product Name -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'admin.addProduct.name' | translate }}</label>
                <input 
                  type="text" 
                  formControlName="name"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-500]="isFieldInvalid('name')"
                  [class.border-gray-300]="!isFieldInvalid('name')"
                  [placeholder]="'admin.addProduct.namePlaceholder' | translate">
                @if (isFieldInvalid('name')) {
                  <p class="mt-1 text-sm text-red-500">
                    @if (productForm.get('name')?.hasError('required')) {
                      Product name is required
                    } @else if (productForm.get('name')?.hasError('maxlength')) {
                      Product name must not exceed 50 characters
                    }
                  </p>
                }
              </div>

              <!-- Description -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'admin.addProduct.description' | translate }}</label>
                <textarea 
                  formControlName="description"
                  rows="3" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  [class.border-red-500]="isFieldInvalid('description')"
                  [class.border-gray-300]="!isFieldInvalid('description')"
                  [placeholder]="'admin.addProduct.descriptionPlaceholder' | translate">
                </textarea>
                @if (isFieldInvalid('description')) {
                  <p class="mt-1 text-sm text-red-500">
                    Description must not exceed 1000 characters
                  </p>
                }
              </div>

              <!-- Price and Stock -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'admin.addProduct.price' | translate }}</label>
                  <input 
                    type="number" 
                    formControlName="price"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [class.border-red-500]="isFieldInvalid('price')"
                    [class.border-gray-300]="!isFieldInvalid('price')"
                    [placeholder]="'admin.addProduct.pricePlaceholder' | translate"
                    min="0">
                  @if (isFieldInvalid('price')) {
                    <p class="mt-1 text-sm text-red-500">
                      @if (productForm.get('price')?.hasError('required')) {
                        Price is required
                      } @else if (productForm.get('price')?.hasError('min')) {
                        Price must be greater than or equal to 0
                      }
                    </p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'admin.addProduct.stock' | translate }}</label>
                  <input 
                    type="number" 
                    formControlName="stock"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [class.border-red-500]="isFieldInvalid('stock')"
                    [class.border-gray-300]="!isFieldInvalid('stock')"
                    [placeholder]="'admin.addProduct.stockPlaceholder' | translate"
                    min="0">
                  @if (isFieldInvalid('stock')) {
                    <p class="mt-1 text-sm text-red-500">
                      @if (productForm.get('stock')?.hasError('required')) {
                        Stock is required
                      } @else if (productForm.get('stock')?.hasError('min')) {
                        Stock must be a non-negative number
                      }
                    </p>
                  }
                </div>
              </div>

              <!-- Category -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'admin.addProduct.category' | translate }}</label>
                <select 
                  formControlName="categoryId"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-500]="isFieldInvalid('categoryId')"
                  [class.border-gray-300]="!isFieldInvalid('categoryId')">
                  <option value="">{{ 'admin.addProduct.selectCategory' | translate }}</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
                @if (isFieldInvalid('categoryId')) {
                  <p class="mt-1 text-sm text-red-500">
                    Category is required
                  </p>
                }
              </div>

              <!-- Checkboxes -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="flex items-center">
                  <input 
                    type="checkbox" 
                    formControlName="isFasting" 
                    id="isFasting"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <label for="isFasting" class="ml-2 text-sm text-gray-700">{{ 'admin.addProduct.isFasting' | translate }}</label>
                </div>
                <div class="flex items-center">
                  <input 
                    type="checkbox" 
                    formControlName="haveSale" 
                    id="haveSale"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <label for="haveSale" class="ml-2 text-sm text-gray-700">{{ 'admin.addProduct.haveSale' | translate }}</label>
                </div>
              </div>

              <!-- Popularity -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'admin.addProduct.popularity' | translate }}</label>
                <input 
                  type="number" 
                  formControlName="popularity"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-500]="isFieldInvalid('popularity')"
                  [class.border-gray-300]="!isFieldInvalid('popularity')"
                  [placeholder]="'admin.addProduct.popularityPlaceholder' | translate"
                  min="0">
                @if (isFieldInvalid('popularity')) {
                  <p class="mt-1 text-sm text-red-500">
                    Popularity must be a non-negative number
                  </p>
                }
              </div>

              <!-- Error Message -->
              @if (error()) {
                <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-red-600 text-sm">{{ error() }}</p>
                </div>
              }

              <!-- Success Message -->
              @if (success()) {
                <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p class="text-green-600 text-sm">{{ success() }}</p>
                </div>
              }

              <!-- Submit Button -->
              <div class="flex gap-4">
                <button 
                  type="submit" 
                  [disabled]="submitting()"
                  class="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (submitting()) {
                    <span class="flex items-center justify-center gap-2">
                      <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      {{ 'admin.addProduct.adding' | translate }}
                    </span>
                  } @else {
                    {{ 'admin.addProduct.addProduct' | translate }}
                  }
                </button>
                <a 
                  routerLink="/en/admin/products/add"
                  class="flex-1 py-3 px-4 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors text-center">
                  {{ 'admin.addProduct.cancel' | translate }}
                </a>
              </div>
            </form>
          </div>
        }
      </div>
    </div>
  `
})
export class AddProductComponent implements OnInit {
  private adminProductService = inject(AdminProductService);
  private categoryService = inject(CategoryService);
  private tokenService = inject(TokenService);
  private fb = inject(FormBuilder);

  // Reactive form with validation (supplierId removed - will be set from token)
  productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(1000)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', [Validators.required]],
    isFasting: [false],
    haveSale: [false],
    popularity: [0, [Validators.min(0)]]
  });

  // States
  submitting = signal(false);
  loadingCategories = signal(true);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  categories = signal<Category[]>([]);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        // Ensure categories is an array
        this.categories.set(Array.isArray(categories) ? categories : []);
        this.loadingCategories.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error.set('Failed to load categories');
        this.loadingCategories.set(false);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  addProduct(): void {
    // Mark all fields as touched to show validation errors
    this.productForm.markAllAsTouched();

    if (this.productForm.invalid) {
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);

    // Get user ID from token claims to use as supplier ID
    const userId = this.tokenService.getUserId() || '';
    
    // Create product data with supplierId from token
    const productData = {
      ...this.productForm.value,
      supplierId: userId
    };

    this.adminProductService.addProduct(productData).subscribe({
      next: (response) => {
        console.log('Product added successfully:', response);
        this.submitting.set(false);
        this.success.set('Product added successfully!');
        
        // Reset form
        this.productForm.reset({
          name: '',
          description: '',
          price: 0,
          stock: 0,
          categoryId: '',
          isFasting: false,
          haveSale: false,
          popularity: 0
        });
      },
      error: (error) => {
        console.error('Error adding product:', error);
        this.submitting.set(false);
        this.error.set(error.error?.message || error.error?.error || 'Failed to add product. Please try again.');
      }
    });
  }
}
