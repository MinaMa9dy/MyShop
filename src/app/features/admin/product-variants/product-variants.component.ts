import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { AttributeService, Attribute } from '../../../core/services/attribute.service';
import { ProductVariant, AddProductVariantDto } from '../../../core/models/product.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-variant-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  template: `
    <section class="space-y-8 sm:space-y-12">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-outline-variant/10 pb-6 gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span class="material-symbols-outlined">layers</span>
          </div>
          <div>
            <h3 class="font-headline font-black text-xl text-on-surface leading-none">{{ 'admin.variants.title' | translate }}</h3>
            <p class="text-[10px] font-bold text-outline uppercase tracking-widest mt-1">{{ 'admin.variants.subtitle' | translate }}</p>
          </div>
        </div>
        <button (click)="showAddForm.set(!showAddForm())"
                class="w-full sm:w-auto px-8 py-3 bg-primary text-on-primary rounded-2xl font-headline font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
          {{ (showAddForm() ? 'admin.variants.cancel' : 'admin.variants.addNew') | translate }}
        </button>
      </div>

      <!-- Add/Edit Variant Form -->
      @if (showAddForm()) {
        <div class="bg-surface-container-low p-6 sm:p-10 rounded-[40px] border border-primary/10 shadow-xl animate-slide-up overflow-hidden relative">
          <div class="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <span class="material-symbols-outlined text-8xl">edit_note</span>
          </div>
          
          <form [formGroup]="variantForm" (ngSubmit)="onSaveVariant()" class="space-y-10 relative z-10">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div class="space-y-3">
                <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">SKU</label>
                <input type="text" formControlName="sku" 
                       class="w-full bg-surface px-6 py-4 rounded-2xl border border-outline-variant/20 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold transition-all">
              </div>
              <div class="space-y-3">
                <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'admin.addProduct.price' | translate }}</label>
                <div class="relative">
                  <input type="number" formControlName="price" 
                         class="w-full bg-surface pl-12 pr-6 py-4 rounded-2xl border border-outline-variant/20 focus:border-primary outline-none text-sm font-bold">
                  <span class="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-outline">EGP</span>
                </div>
              </div>
              <div class="space-y-3">
                <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'admin.addProduct.stock' | translate }}</label>
                <input type="number" formControlName="stockQuantity" 
                       class="w-full bg-surface px-6 py-4 rounded-2xl border border-outline-variant/20 focus:border-primary outline-none text-sm font-bold">
              </div>
            </div>

            <!-- Attributes Selection -->
            <div class="space-y-6">
              <div class="flex items-center justify-between px-2">
                <p class="text-[10px] font-black uppercase tracking-widest text-outline">{{ 'admin.variants.attributes' | translate }}</p>
                <button type="button" (click)="addAttribute()" class="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <span class="material-symbols-outlined text-sm">add_circle</span>
                  {{ 'admin.variants.addAttribute' | translate }}
                </button>
              </div>

              <div formArrayName="attributes" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @for (attr of attributeControls.controls; track attr; let i = $index) {
                  <div [formGroupName]="i" class="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-surface p-4 sm:p-5 rounded-[28px] border border-outline-variant/10 group/item hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all relative">
                    <div class="flex-grow min-w-[140px]">
                      <select formControlName="attributeId" class="w-full bg-transparent border-none text-xs font-black uppercase tracking-wider outline-none cursor-pointer focus:ring-0">
                        <option value="">{{ 'admin.variants.selectAttribute' | translate }}</option>
                        @for (a of availableAttributes(); track a.id) {
                          <option [value]="a.id">{{ a.name }}</option>
                        }
                      </select>
                    </div>
                    
                    <div class="h-6 w-[1px] bg-outline-variant/20 hidden sm:block"></div>
                    
                    <div class="flex-grow sm:flex-grow-0">
                      <input type="text" formControlName="value" [placeholder]="'admin.variants.valuePlaceholder' | translate" 
                             class="w-full sm:w-32 bg-transparent border-none text-xs font-bold outline-none focus:ring-0 px-2 placeholder:opacity-30">
                    </div>

                    <button type="button" (click)="removeAttribute(i)" 
                            class="absolute -top-2 -right-2 sm:static w-8 h-8 rounded-full flex items-center justify-center bg-error/10 text-error opacity-0 group-hover/item:opacity-100 transition-all hover:scale-110 shadow-sm">
                      <span class="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                }
              </div>
            </div>

            <div class="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-outline-variant/10">
              <button type="button" (click)="resetForm()" class="px-8 py-4 bg-surface-container text-outline rounded-2xl font-headline font-bold text-xs uppercase tracking-widest hover:bg-surface-container-high transition-all">
                {{ 'admin.variants.cancel' | translate }}
              </button>
              <button type="submit" [disabled]="submitting()" 
                      class="px-10 py-4 bg-on-surface text-surface rounded-2xl font-headline font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
                @if (submitting()) {
                  <span class="w-4 h-4 border-2 border-surface/30 border-t-white rounded-full animate-spin"></span>
                }
                {{ (editingVariantId() ? 'admin.variants.update' : 'admin.variants.create') | translate }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Variants List -->
      <div class="grid grid-cols-1 gap-6">
        @for (v of variants; track v.id) {
          <div class="flex flex-col xl:flex-row items-stretch xl:items-center justify-between p-4 sm:p-6 bg-surface-container-lowest rounded-[32px] border border-outline-variant/10 group hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all gap-6">
            <div class="flex items-start sm:items-center gap-4 sm:gap-6 flex-grow">
              <div class="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-[20px] bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-2xl">inventory_2</span>
              </div>
              <div class="space-y-2 flex-grow min-w-0">
                <div class="flex items-center gap-3">
                  <h4 class="font-headline font-black text-sm text-on-surface truncate">{{ v.sku }}</h4>
                </div>
                <div class="flex flex-wrap gap-2">
                  @for (attr of v.attributes; track attr.attributeId) {
                    <span class="text-[9px] font-black uppercase tracking-widest bg-surface-container-low px-3 py-1.5 rounded-xl text-outline border border-outline-variant/5">
                      <span class="opacity-50">{{ attr.attributeName }}:</span> {{ attr.value }}
                    </span>
                  }
                </div>
              </div>
            </div>

            <div class="flex flex-wrap sm:flex-nowrap items-center justify-between xl:justify-end gap-4 sm:gap-8 pt-6 xl:pt-0 border-t xl:border-t-0 border-outline-variant/10">
              <div class="flex gap-8">
                <div class="space-y-1">
                  <p class="text-[8px] font-black uppercase tracking-widest text-outline">{{ 'admin.addProduct.price' | translate }}</p>
                  <p class="font-headline font-black text-sm text-primary whitespace-nowrap">{{ v.newPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-[8px] font-black uppercase tracking-widest text-outline">{{ 'admin.addProduct.stock' | translate }}</p>
                  <p class="font-headline font-black text-sm whitespace-nowrap">{{ v.stockQuantity }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2 sm:pl-4">
                <button (click)="editVariant(v)" 
                        class="w-11 h-11 rounded-[16px] bg-surface-container hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm">
                  <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button (click)="deleteVariant(v.id)" [disabled]="submitting()" 
                        class="w-11 h-11 rounded-[16px] bg-surface-container hover:bg-error/10 hover:text-error flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm">
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `
})
export class ProductVariantManagementComponent implements OnInit {
  @Input() productId!: string;
  @Input() variants: ProductVariant[] = [];

  private productService = inject(ProductService);
  private attributeService = inject(AttributeService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  showAddForm = signal(false);
  submitting = signal(false);
  availableAttributes = signal<Attribute[]>([]);
  editingVariantId = signal<string | null>(null);

  variantForm: FormGroup = this.fb.group({
    sku: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    attributes: this.fb.array([])
  });

  get attributeControls() { return this.variantForm.get('attributes') as FormArray; }

  ngOnInit() {
    this.loadAttributes();
  }

  loadAttributes() {
    this.attributeService.getAll().subscribe({
      next: (attrs) => this.availableAttributes.set(attrs),
      error: () => console.error('Failed to load attributes')
    });
  }

  addAttribute(attrId: string = '', value: string = '') {
    this.attributeControls.push(this.fb.group({
      attributeId: [attrId, Validators.required],
      value: [value, Validators.required]
    }));
  }

  removeAttribute(index: number) { this.attributeControls.removeAt(index); }

  editVariant(v: ProductVariant) {
    this.editingVariantId.set(v.id);
    this.variantForm.patchValue({
      sku: v.sku,
      price: v.newPrice,
      stockQuantity: v.stockQuantity
    });
    this.attributeControls.clear();
    v.attributes.forEach(a => this.addAttribute(a.attributeId, a.value));
    this.showAddForm.set(true);
  }

  onSaveVariant() {
    if (this.variantForm.invalid) return;
    this.submitting.set(true);

    const dto: AddProductVariantDto = this.variantForm.value;
    const req = this.editingVariantId() 
      ? this.productService.updateVariant(this.productId, this.editingVariantId()!, dto)
      : this.productService.addVariant(this.productId, dto);

    req.subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          if (this.editingVariantId()) {
            const idx = this.variants.findIndex(v => v.id === res.data!.id);
            if (idx !== -1) this.variants[idx] = res.data;
          } else {
            this.variants.push(res.data);
          }
          this.resetForm();
          this.toast.showSuccess('Variant synchronized successfully');
        }
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false)
    });
  }

  deleteVariant(variantId: string) {
    if (!confirm('Are you sure you want to decommission this variant?')) return;
    this.submitting.set(true);
    this.productService.deleteVariant(this.productId, variantId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const idx = this.variants.findIndex(v => v.id === variantId);
          if (idx !== -1) this.variants.splice(idx, 1);
          this.toast.showInfo('Variant removed');
        }
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false)
    });
  }


  resetForm() {
    this.variantForm.reset({ price: 0, stockQuantity: 0 });
    this.attributeControls.clear();
    this.showAddForm.set(false);
    this.editingVariantId.set(null);
  }
}
