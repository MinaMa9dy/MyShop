import { Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Category } from '../../core/models/category.model';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-category-tree',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="flex flex-col" [attr.dir]="isRtl() ? 'rtl' : 'ltr'">

      <!-- ── "All Categories" header ── -->
      <button
        (click)="categorySelected.emit('')"
        class="group flex items-center justify-between w-full px-4 py-3.5 rounded-2xl mb-3 transition-all duration-200"
        [class]="selectedId() === '' ? 'bg-blue-50 text-blue-700 font-black' : 'text-on-surface hover:bg-gray-100 font-bold'">
        <span class="font-black text-[13px] uppercase tracking-widest">
          {{ 'home.allCategories' | translate }}
        </span>
        <span class="material-symbols-outlined text-[20px] opacity-50 group-hover:opacity-100 transition-opacity"
              [class.rotate-180]="isRtl()">
          chevron_right
        </span>
      </button>

      <!-- ── Separator ── -->
      <div class="h-px bg-outline-variant/20 mb-3 mx-1"></div>

      <!-- ── Recursive tree ── -->
      <div class="flex flex-col gap-0.5 overflow-y-auto custom-scrollbar" style="max-height: var(--tree-max-height, 65vh)">
        <ng-container *ngTemplateOutlet="nodeList; context: { items: categories(), depth: 0 }">
        </ng-container>
      </div>
    </div>

    <!-- ══ Recursive node template ══ -->
    <ng-template #nodeList let-items="items" let-depth="depth">
      @for (cat of items; track cat.id) {
        <div class="flex flex-col">

          <!-- Row -->
          <div class="flex items-center rounded-2xl transition-all duration-200 overflow-hidden"
               [class]="selectedId() === cat.id
                 ? 'bg-blue-50 text-blue-700'
                 : 'hover:bg-gray-100 text-gray-600'"
               [style.padding-inline-start.px]="depth * 14">

            <!-- Expand / collapse button (only when children exist) -->
            @if (cat.children?.length) {
              <button
                (click)="toggle(cat.id, $event)"
                class="flex items-center justify-center w-9 h-10 shrink-0 transition-all"
                [attr.aria-expanded]="isOpen(cat.id)">
                <span class="material-symbols-outlined text-[20px] transition-transform duration-300 opacity-50"
                      [class.rotate-90]="isOpen(cat.id) && !isRtl()"
                      [class.-rotate-90]="isOpen(cat.id) && isRtl()">
                  {{ isRtl() ? 'chevron_left' : 'chevron_right' }}
                </span>
              </button>
            } @else {
              <!-- Spacer so names stay aligned -->
              <span class="w-9 shrink-0"></span>
            }

            <!-- Icon for root level only -->
            @if (depth === 0) {
              <span class="material-symbols-outlined text-[20px] mr-3 rtl:ml-3 rtl:mr-0 shrink-0 opacity-60"
                    [class.text-primary]="selectedId() === cat.id">
                label
              </span>
            } @else {
              <span class="w-2 h-2 rounded-full shrink-0 mr-3 rtl:ml-3 rtl:mr-0 transition-colors"
                    [class]="selectedId() === cat.id ? 'bg-primary' : 'bg-outline-variant'"></span>
            }

            <!-- Name (click to select) -->
            <button
              (click)="select(cat.id)"
              class="flex-1 text-start ltr:text-left rtl:text-right py-3 font-semibold text-[13.5px] leading-snug transition-colors"
              [class.font-black]="selectedId() === cat.id"
              [class.text-primary]="selectedId() === cat.id">
              {{ cat.name }}
            </button>

            <!-- Active indicator dot -->
            @if (selectedId() === cat.id) {
              <span class="w-2 h-2 rounded-full bg-primary shrink-0 mx-3"></span>
            }
          </div>

          <!-- Children -->
          @if (cat.children?.length && isOpen(cat.id)) {
            <div class="mt-0.5 border-s-2 border-gray-200 ms-[18px]">
              <ng-container *ngTemplateOutlet="nodeList; context: { items: cat.children, depth: depth + 1 }">
              </ng-container>
            </div>
          }

        </div>
      }
    </ng-template>
  `,
  styles: [`
    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,.08) transparent; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,.08); border-radius: 8px; }
  `]
})
export class CategoryTreeComponent {
  /** The full nested category tree */
  categories = input<Category[]>([]);
  /** Currently selected category id (empty string = All) */
  selectedId = input<string>('');
  /** Emitted when user picks a category; empty string means "All" */
  categorySelected = output<string>();

  private lang = inject(LanguageService);
  isRtl = () => this.lang.currentLanguage() === 'ar';

  private openIds = signal<Set<string>>(new Set());

  isOpen(id: string): boolean { return this.openIds().has(id); }

  toggle(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openIds.update(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  select(id: string): void {
    this.categorySelected.emit(id);
    // Auto-expand when selecting a parent that has children
  }
}
