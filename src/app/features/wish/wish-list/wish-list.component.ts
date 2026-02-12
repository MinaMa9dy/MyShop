import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { WishService } from '../../../core/services/wish.service';
import { CartService } from '../../../core/services/cart.service';
import { TokenService } from '../../../core/services/token.service';
import { LanguageService } from '../../../core/services/language.service';
import { PhotoService } from '../../../core/services/photo.service';
import { Wish } from '../../../core/models/wish.model';

@Component({
  selector: 'app-wish-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './wish-list.component.html',
})
export class WishListComponent implements OnInit {
  private wishService = inject(WishService);
  private cartService = inject(CartService);
  private tokenService = inject(TokenService);
  private languageService = inject(LanguageService);
  private photoService = inject(PhotoService);
  private router = inject(Router);

  // Signals
  wishes = signal<Wish[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  removingId = signal<string | null>(null);
  addingId = signal<string | null>(null);

  // Placeholder image URL
  placeholder = 'assets/images/placeholder.svg';

  // Track image errors to prevent infinite loops
  private imageErrors = new Set<string>();

  get currentLang(): string {
    return this.languageService.currentLanguage();
  }

  get isRtl(): boolean {
    return this.currentLang === 'ar';
  }

  ngOnInit(): void {
    this.loadWishes();
  }

  loadWishes(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.error.set('User not logged in');
      this.loading.set(false);
      return;
    }

    this.wishService.getWishes(userId).subscribe({
      next: (wishes) => {
        console.log('Wishes loaded:', wishes);
        this.wishes.set(wishes);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load wishes');
        this.loading.set(false);
        console.error('Error loading wishes:', err);
      }
    });
  }

  getMainPhotoUrl(wish: Wish): string {
    const photos = wish.product?.productPhotos;
    if (photos && photos.length > 0) {
      const mainPhoto = photos.find(p => p.isMain);
      if (mainPhoto) {
        return this.photoService.getPhotoUrl(mainPhoto.fileName);
      }
      return this.photoService.getPhotoUrl(photos[0].fileName);
    }
    return this.placeholder;
  }

  addToCart(wish: Wish): void {
    const productId = wish.productId;
    if (!productId) return;

    this.addingId.set(productId);
    this.cartService.addToCart(productId, 1).subscribe({
      next: () => {
        console.log('Added to cart successfully');
        this.addingId.set(null);
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        this.addingId.set(null);
      }
    });
  }

  removeFromWish(wish: Wish): void {
    const userId = this.tokenService.getUserId();
    if (!userId || !wish.productId) return;

    // Set removing state
    this.removingId.set(wish.productId);

    this.wishService.removeWish(userId, wish.productId).subscribe({
      next: () => {
        // Update UI only after successful API response
        // Filter by productId since backend doesn't return an id field
        this.wishes.update(items => items.filter(item => item.productId !== wish.productId));
        this.removingId.set(null);
      },
      error: (err) => {
        console.error('Error removing wish:', err);
        this.removingId.set(null);
      }
    });
  }

  goToProduct(productId: string): void {
    this.router.navigate(['/' + this.currentLang + '/products', productId]);
  }

  continueShopping(): void {
    this.router.navigate(['/' + this.currentLang + '/products']);
  }

  handleImageError(event: Event, productId: string): void {
    if (!this.imageErrors.has(productId)) {
      this.imageErrors.add(productId);
      const img = event.target as HTMLImageElement;
      img.src = this.placeholder;
    }
  }
}
