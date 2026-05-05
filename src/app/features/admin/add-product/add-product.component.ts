import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { AddProductDto, UpdateProductDto } from '../../../core/models/product.model';
import { TokenService } from '../../../core/services/token.service';
import { LanguageService } from '../../../core/services/language.service';
import { PhotoService } from '../../../core/services/photo.service';
import { TranslateService } from '@ngx-translate/core';

import { ProductVariantManagementComponent } from '../product-variants/product-variants.component';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TranslatePipe, ProductVariantManagementComponent],
  template: `
    <main class="min-h-screen bg-surface pb-24" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Hero Header -->
      <header class="bg-surface-container-low pt-24 pb-16 border-b border-outline-variant/30 overflow-hidden relative">
        <div class="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--primary)_0%,_transparent_70%)]"></div>
        <div class="max-w-4xl mx-auto px-6 relative z-10">
          <div class="flex flex-col md:flex-row justify-between items-end gap-8 text-start">
            <div>
               <h1 class="font-headline text-5xl font-black tracking-tighter text-on-surface mb-2">
                 {{ (isEditMode() ? 'admin.editProduct' : 'admin.addProduct.title') | translate }}
               </h1>
               <p class="font-body text-on-surface-variant opacity-70">
                 {{ (isEditMode() ? 'admin.editProductSubtitle' : 'admin.addProduct.subtitle') | translate }}
               </p>
            </div>
            <div class="flex items-center gap-3 bg-surface px-6 py-3 rounded-2xl border border-outline-variant/20 shadow-sm">
               <span class="material-symbols-outlined text-primary text-sm animate-pulse">monitoring</span>
               <span class="text-[10px] font-black uppercase tracking-[0.2em] text-outline">{{ 'admin.addProduct.inventorySequence' | translate }}: {{ (isEditMode() ? ('admin.addProduct.modification' | translate) : ('admin.addProduct.creation' | translate)) }}</span>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-4xl mx-auto px-6 py-16 animate-slide-up">
        <!-- Tab Navigation (Edit Mode Only) -->
        @if (isEditMode()) {
          <div class="flex gap-4 mb-12">
            <button (click)="activeTab.set('basic')" 
                    [class]="activeTab() === 'basic' ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'"
                    class="px-8 py-3 rounded-2xl font-headline font-bold text-xs uppercase tracking-widest transition-all">
              {{ 'admin.addProduct.entityIdentity' | translate }}
            </button>
            <button (click)="activeTab.set('variants')" 
                    [class]="activeTab() === 'variants' ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'"
                    class="px-8 py-3 rounded-2xl font-headline font-bold text-xs uppercase tracking-widest transition-all">
              {{ 'admin.variants.title' | translate }}
            </button>
          </div>
        }

        @if (loadingCategories()) {
          <div class="flex flex-col items-center justify-center py-40 gap-4">
            <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p class="font-headline font-black text-xs uppercase tracking-widest text-outline">{{ 'admin.addProduct.mappingTaxonomy' | translate }}</p>
          </div>
        } @else {
          <div class="bg-surface-container-lowest rounded-[48px] shadow-2xl border border-outline-variant/10 overflow-hidden">
            
            @if (activeTab() === 'basic') {
              <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="p-10 md:p-16 space-y-12">
              
              <!-- Basic Identity Section -->
              <section class="space-y-8">
                <div class="flex items-center gap-4 border-b border-outline-variant/10 pb-4">
                  <span class="material-symbols-outlined text-primary">fingerprint</span>
                  <h3 class="font-headline font-black text-xl text-on-surface">{{ 'admin.addProduct.entityIdentity' | translate }}</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-3">
                    <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'admin.addProduct.name' | translate }}</label>
                    <input type="text" formControlName="name"
                           [class.border-error/30]="isFieldInvalid('name')"
                           class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all">
                    @if (isFieldInvalid('name')) { <p class="text-[10px] font-black text-error uppercase px-2">{{ 'admin.addProduct.idRequired' | translate }}</p> }
                  </div>

                  <div class="space-y-3">
                    <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'admin.addProduct.category' | translate }}</label>
                    <select formControlName="categoryId"
                            class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all appearance-none cursor-pointer rtl:pr-6 rtl:pl-12 ltr:px-6">
                      <option value="">{{ 'admin.addProduct.selectCategory' | translate }}</option>
                      @for (cat of categories(); track cat.id) { <option [value]="cat.id">{{ cat.name }}</option> }
                    </select>
                    <span class="material-symbols-outlined absolute end-6 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                  </div>
                </div>

                  <div class="space-y-3">
                    <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'admin.addProduct.description' | translate }}</label>
                    <textarea formControlName="description" rows="4"
                              class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all resize-none"></textarea>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div class="space-y-3">
                      <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'admin.addProduct.popularity' | translate }}</label>
                      <input type="number" formControlName="popularity"
                             class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-headline font-black text-lg text-on-surface transition-all">
                    </div>

                    <div class="flex flex-wrap gap-6 pt-4">
                       <label class="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" formControlName="isFasting" class="hidden peer">
                          <div class="w-6 h-6 border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary transition-all rounded-lg flex items-center justify-center">
                             <span class="material-symbols-outlined text-white text-[16px] scale-0 peer-checked:scale-100 transition-transform font-bold">check</span>
                          </div>
                          <span class="text-xs font-bold text-on-surface-variant group-hover:text-primary transition-colors">{{ 'admin.addProduct.isFasting' | translate }}</span>
                       </label>
                       <label class="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" formControlName="haveSale" class="hidden peer">
                          <div class="w-6 h-6 border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary transition-all rounded-lg flex items-center justify-center">
                             <span class="material-symbols-outlined text-white text-[16px] scale-0 peer-checked:scale-100 transition-transform font-bold">check</span>
                          </div>
                          <span class="text-xs font-bold text-on-surface-variant group-hover:text-primary transition-colors">{{ 'admin.addProduct.haveSale' | translate }}</span>
                       </label>
                    </div>
                  </div>
                </section>

              <!-- Visualization Section -->
              <section class="space-y-8">
                <div class="flex items-center gap-4 border-b border-outline-variant/10 pb-4">
                  <span class="material-symbols-outlined text-primary">collections</span>
                  <h3 class="font-headline font-black text-xl text-on-surface">{{ 'admin.addProduct.visualMedia' | translate }}</h3>
                </div>

                <!-- Existing Photos (Edit Mode) -->
                @if (isEditMode() && (allPhotos().length)) {
                  <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                    @for (photo of allPhotos(); track photo.id) {
                      <div class="relative aspect-square rounded-[32px] overflow-hidden bg-surface-container-low border border-outline-variant/10 group">
                        <img [src]="photoService.getPhotoUrl(photo.fileName)" class="w-full h-full object-cover transition-all duration-500" [class.grayscale]="isPhotoMarkedForDeletion(photo.id)" [class.opacity-40]="isPhotoMarkedForDeletion(photo.id)">
                        <button type="button" (click)="togglePhotoDeletion(photo.id)" 
                                class="absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 z-10 shadow-lg"
                                [class]="isPhotoMarkedForDeletion(photo.id) ? 'bg-primary text-on-primary' : 'bg-white/80 text-on-surface hover:bg-error hover:text-on-error'">
                          <span class="material-symbols-outlined text-lg">{{ isPhotoMarkedForDeletion(photo.id) ? 'undo' : 'delete' }}</span>
                        </button>
                        @if (isPhotoMarkedForDeletion(photo.id)) {
                          <div class="absolute inset-x-0 bottom-4 text-center">
                             <span class="text-[8px] font-black uppercase tracking-widest text-error bg-error/10 px-3 py-1 rounded-full">{{ 'admin.addProduct.decomissioned' | translate }}</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }

                <!-- New Photos Previews -->
                @if (selectedFiles().length > 0) {
                  <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                    @for (fileObj of selectedFiles(); track fileObj.name; let i = $index) {
                      <div class="relative aspect-square rounded-[32px] overflow-hidden bg-primary/5 border-2 border-dashed border-primary/20 group animate-scale-in">
                        <img [src]="fileObj.preview" class="w-full h-full object-cover">
                        <button type="button" (click)="removeNewPhoto(i)" 
                                class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors">
                          <span class="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    }
                  </div>
                }

                <!-- Upload Trigger -->
                <div class="relative">
                   <input type="file" multiple accept="image/*" (change)="onFileSelected($event)" class="hidden" #fileInput>
                   <button type="button" (click)="fileInput.click()"
                           class="w-full group py-12 border-2 border-dashed border-outline-variant/30 rounded-[40px] flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all">
                      <div class="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                         <span class="material-symbols-outlined text-primary text-3xl">upload_file</span>
                      </div>
                      <div class="text-center">
                         <p class="font-headline font-black text-on-surface">{{ 'admin.addProduct.uploadPhotos' | translate }}</p>
                         <p class="text-[10px] font-black uppercase tracking-widest text-outline">{{ 'admin.addProduct.maxResStrategy' | translate }}</p>
                      </div>
                   </button>
                </div>
              </section>

              <!-- Final Control -->
              <footer class="pt-16 border-t border-outline-variant/10 space-y-10">
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

                 <div class="flex flex-col sm:flex-row gap-6">
                    <button type="submit" [disabled]="submitting()"
                            class="flex-[2] py-6 bg-on-surface text-surface rounded-[32px] font-headline font-bold text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group">
                       @if (submitting()) {
                         <span class="w-6 h-6 border-4 border-surface/30 border-t-white rounded-full animate-spin"></span>
                       } @else {
                         <span>{{ (isEditMode() ? 'admin.updateProduct' : 'admin.addProduct.addProduct') | translate }}</span>
                         <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">rocket_launch</span>
                       }
                    </button>
                     <a [routerLink]="'/' + currentLang + '/products'"
                        class="flex-1 py-6 bg-surface-container rounded-[32px] font-headline font-bold text-sm uppercase tracking-widest text-outline hover:bg-surface-container-high transition-all text-center flex items-center justify-center">
                        {{ 'admin.addProduct.cancel' | translate }}
                     </a>
                 </div>
              </footer>

            </form>
            } @else {
              <div class="p-10 md:p-16">
                <app-product-variant-management [productId]="productId()!" [variants]="originalProduct()?.productVariants || []"></app-product-variant-management>
              </div>
            }
          </div>
        }
      </div>
    </main>
  `,
  styles: []
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
  private translate = inject(TranslateService);

  productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(1000)]],
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
  activeTab = signal<'basic' | 'variants'>('basic');
  
  get currentLang(): string { return this.languageService.currentLanguage(); }
  allPhotos = computed(() => this.originalProduct()?.productPhotos || this.originalProduct()?.productphotos || []);

  ngOnInit(): void {
    this.loadCategories();
    this.route.queryParams.subscribe(params => {
      if (params['id']) { this.productId.set(params['id']); this.isEditMode.set(true); this.loadProductForEdit(params['id']); }
    });
  }

  loadProductForEdit(id: string): void {
    this.productService.getById(id).subscribe({
      next: (result: any) => {
        const productData = result.data || result;
        const normalized = this.normalizeProduct(productData);
        
        const userId = this.tokenService.getUserId();
        if ((normalized.supplierId !== userId) && !this.tokenService.hasRole('Admin')) {
           this.error.set(this.translate.instant('admin.addProduct.authFailure')); return;
        }
        
        this.originalProduct.set(normalized);
        this.productForm.patchValue({
          name: normalized.name, 
          description: normalized.description,
          price: normalized.newPrice || normalized.price, 
          stock: normalized.stockQuantity || normalized.shownQuantity,
          categoryId: normalized.categoryId, 
          isFasting: normalized.isFasting,
          haveSale: normalized.haveSale, 
          popularity: normalized.popularity
        });
      },
      error: () => this.error.set(this.translate.instant('admin.addProduct.syncEntityDataFailed'))
    });
  }

  private normalizeProduct(p: any): any {
    if (!p) return p;
    return {
      ...p,
      id: p.id || p.Id,
      name: p.name || p.Name,
      description: p.description || p.Description,
      categoryId: p.categoryId || p.CategoryId,
      supplierId: p.supplierId || p.SupplierId,
      stockQuantity: p.stockQuantity || p.StockQuantity || 0,
      productPhotos: (p.productPhotos || p.ProductPhotos || p.productphotos || []).map((ph: any) => ({
        id: ph.id || ph.Id,
        url: ph.url || ph.Url,
        isMain: ph.isMain ?? ph.IsMain ?? false,
        fileName: ph.fileName || ph.FileName || ph.url || ph.Url
      })),
      productVariants: (p.productVariants || p.ProductVariants || p.productvariants || []).map((v: any) => ({
        id: v.id || v.Id,
        sku: v.sku || v.Sku,
        oldPrice: v.oldPrice || v.OldPrice,
        newPrice: v.newPrice || v.NewPrice,
        stockQuantity: v.stockQuantity || v.StockQuantity,
        attributes: (v.attributes || v.Attributes || []).map((a: any) => ({
          attributeId: a.attributeId || a.AttributeId,
          attributeName: a.attributeName || a.AttributeName,
          value: a.value || a.Value
        }))
      })),
      haveSale: p.haveSale ?? p.HaveSale ?? false,
      isFasting: p.isFasting ?? p.IsFasting ?? false,
      popularity: p.popularity || p.Popularity || 0
    };
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response: any) => {
        const rawCats = Array.isArray(response) ? response : (response.data || []);
        const normalized = rawCats.map((c: any) => ({
          id: c.id || c.Id,
          name: c.name || c.Name
        }));
        this.categories.set(normalized);
        this.loadingCategories.set(false);
      },
      error: () => { 
        this.error.set(this.translate.instant('admin.addProduct.taxonomySyncFailed')); 
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
    for (let i = 0; i < files.length; i++) {
       const file = files[i];
       const reader = new FileReader();
       reader.onload = (e: any) => this.selectedFiles.update(curr => [...curr, { file, name: file.name, preview: e.target.result }]);
       reader.readAsDataURL(file);
    }
  }

  removeNewPhoto(index: number): void { this.selectedFiles.update(curr => curr.filter((_, i) => i !== index)); }
  togglePhotoDeletion(photoId: string): void { this.photoIdsToDelete.update(ids => ids.includes(photoId) ? ids.filter(id => id !== photoId) : [...ids, photoId]); }
  isPhotoMarkedForDeletion(photoId: string): boolean { return this.photoIdsToDelete().includes(photoId); }

  onSubmit(): void { if (this.isEditMode()) this.updateProduct(); else this.addProduct(); }

  addProduct(): void {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) return;
    this.submitting.set(true); this.error.set(null); this.success.set(null);
    
    const formVal = this.productForm.value;
    const productData: AddProductDto = { 
       name: formVal.name,
       description: formVal.description,
       categoryId: formVal.categoryId,
       supplierId: this.tokenService.getUserId() || '',
       isFasting: formVal.isFasting,
       haveSale: formVal.haveSale,
       popularity: formVal.popularity || 0,
       photos: this.selectedFiles().map(f => f.file)
    };

    // Note: The backend AddProductDto might need to include price/stock 
    // or I need to pass them as extra properties if using any.
    // Given the previous backend check, I'll add them.
    (productData as any).price = formVal.price;
    (productData as any).stock = formVal.stock;
    (productData as any).haveSale = formVal.haveSale;

    this.productService.create(productData).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          this.submitting.set(false); 
          this.success.set(this.translate.instant('admin.addProduct.entityIntegrated'));
          this.selectedFiles.set([]); 
          this.productForm.reset({ popularity: 0, isFasting: false, haveSale: false });
        } else {
          this.submitting.set(false);
          this.error.set(result.error?.message || 'Error');
        }
      },
      error: (err) => { this.submitting.set(false); this.error.set('Server error'); }
    });
  }

  updateProduct(): void {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) return;
    this.submitting.set(true); this.error.set(null); this.success.set(null);

    const formVal = this.productForm.value;
    const productData: UpdateProductDto = {
      id: this.productId()!, 
      name: formVal.name, 
      description: formVal.description,
      categoryId: formVal.categoryId,
      supplierId: this.tokenService.getUserId() || '',
      isFasting: formVal.isFasting,
      haveSale: formVal.haveSale,
      popularity: formVal.popularity || 0,
      photos: this.selectedFiles().map(f => f.file),
      photoIdsToDelete: this.photoIdsToDelete()
    };
    


    this.productService.update(productData.id, productData).subscribe({
      next: (result) => {
        if (result.success) {
          this.submitting.set(false); 
          this.success.set(this.translate.instant('admin.addProduct.modificationVerified'));
          setTimeout(() => this.router.navigate([`/${this.currentLang}/products/${this.productId()}`]), 1000);
        } else {
          this.submitting.set(false);
          this.error.set(result.error?.message || 'Error');
        }
      },
      error: () => { this.submitting.set(false); this.error.set('Server error'); }
    });
  }
}

