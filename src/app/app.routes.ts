import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// ── All routes are lang-prefix-free ─────────────────────────────────────────
// /en/* and /ar/* are redirected to the equivalent prefix-less path.
// Language switching is handled via LanguageService + localStorage only.
// ─────────────────────────────────────────────────────────────────────────────

export const routes: Routes = [
  // Home
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'MyShop'
  },

  // Auth
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent),
        title: 'MyShop - Login'
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/components/register/register.component').then(m => m.RegisterComponent),
        title: 'MyShop - Register'
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/auth/components/profile/profile.component').then(m => m.ProfileComponent),
        title: 'MyShop - Profile'
      },
      {
        path: 'confirm-email',
        loadComponent: () => import('./features/auth/components/confirm-email/confirm-email').then(m => m.ConfirmEmailComponent),
        title: 'MyShop - Confirm Email'
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/components/reset-password/reset-password').then(m => m.ResetPasswordComponent),
        title: 'MyShop - Reset Password'
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: 'MyShop - Forgot Password'
      },
      {
        path: 'resend-email-confirmation',
        loadComponent: () => import('./features/auth/components/resend-email-confirmation/resend-email-confirmation.component').then(m => m.ResendEmailConfirmationComponent),
        title: 'MyShop - Resend Confirmation'
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
      }
    ]
  },

  // Products
  {
    path: 'products',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent),
        title: 'MyShop - Products'
      },
      {
        path: ':id',
        loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
        title: 'MyShop - Product Details'
      }
    ]
  },

  // Cart
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    title: 'MyShop - Cart'
  },

  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'MyShop - Dashboard'
  },
  {
    path: 'dashboard/my-coupons',
    loadComponent: () => import('./features/dashboard/my-coupons/my-coupons.component').then(m => m.MyCouponsComponent),
    canActivate: [authGuard],
    title: 'MyShop - My Coupons'
  },

  // Categories
  {
    path: 'categories',
    loadComponent: () => import('./features/categories/category-list/category-list.component').then(m => m.CategoryListComponent),
    title: 'MyShop - Categories'
  },

  // Orders
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent),
    canActivate: [authGuard],
    title: 'MyShop - Orders'
  },
  {
    path: 'orders/confirm',
    loadComponent: () => import('./features/orders/order-confirm/order-confirm.component').then(m => m.OrderConfirmComponent),
    canActivate: [authGuard],
    title: 'MyShop - Confirm Order'
  },

  // Admin
  {
    path: 'admin/products/add',
    loadComponent: () => import('./features/admin/add-product/add-product.component').then(m => m.AddProductComponent),
    canActivate: [authGuard],
    title: 'MyShop - Add Product'
  },
  {
    path: 'admin/categories/add',
    loadComponent: () => import('./features/admin/add-category/add-category.component').then(m => m.AddCategoryComponent),
    canActivate: [authGuard],
    title: 'MyShop - Add Category'
  },
  {
    path: 'admin/coupons',
    loadComponent: () => import('./features/admin/coupons/coupon-list/coupon-list.component').then(m => m.CouponListComponent),
    canActivate: [authGuard],
    title: 'MyShop - Manage Coupons'
  },
  {
    path: 'admin/coupons/add',
    loadComponent: () => import('./features/admin/coupons/coupon-form/coupon-form.component').then(m => m.CouponFormComponent),
    canActivate: [authGuard],
    title: 'MyShop - Add Coupon'
  },
  {
    path: 'admin/coupons/edit/:id',
    loadComponent: () => import('./features/admin/coupons/coupon-form/coupon-form.component').then(m => m.CouponFormComponent),
    canActivate: [authGuard],
    title: 'MyShop - Edit Coupon'
  },
  {
    path: 'admin/coupons/assign/:id',
    loadComponent: () => import('./features/admin/coupons/coupon-assign/coupon-assign.component').then(m => m.CouponAssignComponent),
    canActivate: [authGuard],
    title: 'MyShop - Assign Products'
  },
  {
    path: 'admin/coupons/users/:id',
    loadComponent: () => import('./features/admin/coupons/coupon-user/coupon-user.component').then(m => m.CouponUserComponent),
    canActivate: [authGuard],
    title: 'MyShop - User Assignments'
  },

  // Wishlist
  {
    path: 'wishes',
    loadComponent: () => import('./features/wish/wish-list/wish-list.component').then(m => m.WishListComponent),
    canActivate: [authGuard],
    title: 'MyShop - Wishlist'
  },

  // ── Legacy redirects: strip /en/* and /ar/* prefixes ─────────────────────
  {
    path: 'en',
    children: [
      { path: '', pathMatch: 'full', redirectTo: '/' },
      {
        path: '**',
        redirectTo: ({ url }) => '/' + url.map(s => s.path).join('/')
      }
    ]
  },
  {
    path: 'ar',
    children: [
      { path: '', pathMatch: 'full', redirectTo: '/' },
      {
        path: '**',
        redirectTo: ({ url }) => '/' + url.map(s => s.path).join('/')
      }
    ]
  },

  // Catch-all → home
  { path: '**', redirectTo: '' }
];
