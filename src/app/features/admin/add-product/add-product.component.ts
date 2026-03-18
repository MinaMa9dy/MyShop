import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { TokenService } from '../../../core/services/token.service';
import { LanguageService } from '../../../core/services/language.service';
import { PhotoService } from '../../../core/services/photo.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="add-product-page min-h-screen bg-gray-50 py-8">
      <div class="max-w-2xl mx-auto px-4">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            {{ (isEditMode() ? 'admin.editProduct' : 'admin.addProduct.title') | translate }}
          </h1>
          <p class="text-gray-500">
            {{ (isEditMode() ? 'admin.editProductSubtitle' : 'admin.addProduct.subtitle') | translate }}
          </p>
        </div>

        <!-- Loading Categories -->
        @if (loadingCategories()) {
          <div class="flex justify-center py-8">
            <div class="loading-spinner w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        } @else {
          <!-- Form Card -->
          <div class="card bg-white rounded-xl shadow-sm p-6">
            <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
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
 
               <!-- Photos Section -->
               <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'admin.addProduct.photos' | translate }}</label>
                
                <!-- Existing Photos (Edit Mode) -->
                @if (isEditMode() && (originalProduct()?.productPhotos?.length || originalProduct()?.productphotos?.length)) {
                  <div class="grid grid-cols-4 gap-4 mb-4">
                    @for (photo of (originalProduct().productPhotos || originalProduct().productphotos); track photo.id) {
                      <div class="relative group aspect-square rounded-lg overflow-hidden border bg-gray-100">
                        <img [src]="photoService.getPhotoUrl(photo.fileName)" class="w-full h-full object-cover" [class.opacity-40]="isPhotoMarkedForDeletion(photo.id)">
                        <button 
                          type="button"
                          (click)="togglePhotoDeletion(photo.id)"
                          class="absolute top-1 right-1 p-1 bg-white/80 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          [title]="(isPhotoMarkedForDeletion(photo.id) ? 'admin.addProduct.keepPhoto' : 'admin.addProduct.deletePhoto') | translate">
                          @if (isPhotoMarkedForDeletion(photo.id)) {
                            <i class="fas fa-undo text-blue-600"></i>
                          } @else {
                            <i class="fas fa-trash text-red-600"></i>
                          }
                        </button>
                        @if (isPhotoMarkedForDeletion(photo.id)) {
                          <div class="absolute inset-0 flex items-center justify-center bg-red-500/10 pointer-events-none">
                            <span class="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded">{{ 'admin.addProduct.deleted' | translate }}</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
 
                <!-- New Photos Previews -->
                @if (selectedFiles().length > 0) {
                  <div class="grid grid-cols-4 gap-4 mb-4">
                    @for (fileObj of selectedFiles(); track fileObj.name; let i = $index) {
                      <div class="relative group aspect-square rounded-lg overflow-hidden border bg-gray-50">
                        <img [src]="fileObj.preview" class="w-full h-full object-cover">
                        <button 
                          type="button"
                          (click)="removeNewPhoto(i)"
                          class="absolute top-1 right-1 p-1 bg-white/80 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          <i class="fas fa-times text-gray-600"></i>
                        </button>
                      </div>
                    }
                  </div>
                }
 
                <!-- Add Photos Input -->
                <div class="relative">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    (change)="onFileSelected($event)"
                    class="hidden" 
                    #fileInput>
                  <button 
                    type="button"
                    (click)="fileInput.click()"
                    class="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all flex flex-col items-center justify-center gap-1">
                    <i class="fas fa-cloud-upload-alt text-2xl"></i>
                    <span class="text-sm font-medium">{{ 'admin.addProduct.uploadPhotos' | translate }}</span>
                  </button>
                </div>
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
                      {{ (isEditMode() ? 'admin.updating' : 'admin.addProduct.adding') | translate }}
                    </span>
                  } @else {
                    {{ (isEditMode() ? 'admin.updateProduct' : 'admin.addProduct.addProduct') | translate }}
                  }
                </button>
                <a 
                  [routerLink]="'/' + currentLang + '/products'"
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
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private tokenService = inject(TokenService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private languageService = inject(LanguageService);
  public photoService = inject(PhotoService);

  get currentLang(): string {
    return this.languageService.currentLanguage();
  }

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

  submitting = signal(false);
  loadingCategories = signal(true);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  categories = signal<Category[]>([]);
  isEditMode = signal(false);
  productId = signal<string | null>(null);
  originalProduct = signal<any>(null);
  
  selectedFiles = signal<{file: File, name: string, preview: string}[]>([]);
  photoIdsToDelete = signal<string[]>([]);

  ngOnInit(): void {
    this.loadCategories();
    
    // Check for ID parameter to enable EDIT mode
    this.route.queryParams.subscribe((params: any) => {
      const id = params['id'];
      if (id) {
        this.productId.set(id);
        this.isEditMode.set(true);
        this.loadProductForEdit(id);
      }
    });
  }

  loadProductForEdit(id: string): void {
    this.productService.getById(id).subscribe({
      next: (product: any) => {
        // Authorization check: User must be the owner
        const userId = this.tokenService.getUserId();
        const isOwner = product.supplierId === userId || product.SupplierId === userId;
        const isAdmin = this.tokenService.hasRole('Admin');
        
        if (!isOwner && !isAdmin) {
          this.error.set('You are not authorized to edit this product.');
          return;
        }

        // Populate form
        this.originalProduct.set(product);
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.newPrice || product.price,
          stock: product.stockQuantity || product.shownQuantity,
          categoryId: product.categoryId,
          isFasting: product.isFasting || product.isfasting,
          haveSale: product.haveSale,
          popularity: product.popularity
        });
      },
      error: (err: any) => {
        console.error('Error loading product for edit:', err);
        this.error.set('Failed to load product data.');
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories: any) => {
        // Ensure categories is an array
        this.categories.set(Array.isArray(categories) ? categories : []);
        this.loadingCategories.set(false);
      },
      error: (error: any) => {
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
  
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedFiles.update(current => [
            ...current, 
            { file, name: file.name, preview: e.target.result }
          ]);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeNewPhoto(index: number): void {
    this.selectedFiles.update(current => {
      const updated = [...current];
      updated.splice(index, 1);
      return updated;
    });
  }

  togglePhotoDeletion(photoId: string): void {
    this.photoIdsToDelete.update(ids => {
      if (ids.includes(photoId)) {
        return ids.filter(id => id !== photoId);
      } else {
        return [...ids, photoId];
      }
    });
  }

  isPhotoMarkedForDeletion(photoId: string): boolean {
    return this.photoIdsToDelete().includes(photoId);
  }

  onSubmit(): void {
    if (this.isEditMode()) {
      this.updateProduct();
    } else {
      this.addProduct();
    }
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
    const productData: any = {
      name: this.productForm.value.name,
      description: this.productForm.value.description,
      price: this.productForm.value.price,
      isfasting: this.productForm.value.isFasting,
      haveSale: this.productForm.value.haveSale,
      popularity: this.productForm.value.popularity,
      stock: this.productForm.value.stock,
      categoryId: this.productForm.value.categoryId,
      supplierId: userId
    };

    if (this.selectedFiles().length > 0) {
      productData.Photos = this.selectedFiles().map(f => f.file);
    }

    this.productService.addProduct(productData).subscribe({
      next: (response: any) => {
        console.log('Product added successfully:', response);
        this.submitting.set(false);
        this.success.set('Product added successfully!');
        this.selectedFiles.set([]);
        this.photoIdsToDelete.set([]);
        
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
      error: (error: any) => {
        console.error('Error adding product:', error);
        this.submitting.set(false);
        this.error.set(error.error?.message || error.error?.error || 'Failed to add product. Please try again.');
      }
    });
  }

  updateProduct(): void {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) return;

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);

    const userId = this.tokenService.getUserId() || '';
    const orig = this.originalProduct();
    
    // Explicitly mapping to UpdateProductDto fields
    const productData: any = {
      id: this.productId()!,
      name: this.productForm.value.name,
      description: this.productForm.value.description,
      haveSale: this.productForm.value.haveSale,
      popularity: this.productForm.value.popularity || 0,
      oldPrice: orig?.oldPrice || (orig?.newPrice || this.productForm.value.price), // Fallback logic
      newPrice: this.productForm.value.price,
      stockQuantity: this.productForm.value.stock,
      shownQuantity: this.productForm.value.stock, // Usually same as stock if not specified otherwise
      supplierId: userId,
      categoryId: this.productForm.value.categoryId
    };

    // Add photos
    if (this.selectedFiles().length > 0) {
      productData.Photos = this.selectedFiles().map(f => f.file);
    }

    // Add photo IDs to delete
    if (this.photoIdsToDelete().length > 0) {
      productData.PhotoIdsToDelete = this.photoIdsToDelete();
    }

    this.productService.update(productData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set('Product updated successfully!');
        setTimeout(() => {
          this.router.navigate([`/${this.currentLang}/products/${this.productId()}`]);
        }, 1500);
      },
      error: (err: any) => {
        console.error('Error updating product:', err);
        this.submitting.set(false);
        this.error.set('Failed to update product. Please try again.');
      }
    });
  }
}
