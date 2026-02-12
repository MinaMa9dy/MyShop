import { Routes, Router, ActivatedRouteSnapshot } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LanguageService } from './core/services/language.service';
import { inject } from '@angular/core';

export const routes: Routes = [
  // English routes (default)
  {
    path: 'en',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
        title: 'MyShop - Home'
      },
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
            path: '',
            pathMatch: 'full',
            redirectTo: 'login'
          }
        ]
      },
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
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
        title: 'MyShop - Cart'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard],
        title: 'MyShop - Dashboard'
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/category-list/category-list.component').then(m => m.CategoryListComponent),
        title: 'MyShop - Categories'
      },
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
      {
        path: 'admin/products/add',
        loadComponent: () => import('./features/admin/add-product/add-product.component').then(m => m.AddProductComponent),
        canActivate: [authGuard],
        title: 'MyShop - Add Product'
      },
      {
        path: 'wishes',
        loadComponent: () => import('./features/wish/wish-list/wish-list.component').then(m => m.WishListComponent),
        canActivate: [authGuard],
        title: 'MyShop - Wishlist'
      }
    ]
  },
  // Arabic routes
  {
    path: 'ar',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
        title: 'MyShop - الرئيسية'
      },
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent),
            title: 'MyShop - تسجيل الدخول'
          },
          {
            path: 'register',
            loadComponent: () => import('./features/auth/components/register/register.component').then(m => m.RegisterComponent),
            title: 'MyShop - التسجيل'
          },
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'login'
          }
        ]
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent),
            title: 'MyShop - المنتجات'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
            title: 'MyShop - تفاصيل المنتج'
          }
        ]
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
        title: 'MyShop - السلة'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard],
        title: 'MyShop - لوحة التحكم'
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/category-list/category-list.component').then(m => m.CategoryListComponent),
        title: 'MyShop - الفئات'
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent),
        canActivate: [authGuard],
        title: 'MyShop - الطلبات'
      },
      {
        path: 'orders/confirm',
        loadComponent: () => import('./features/orders/order-confirm/order-confirm.component').then(m => m.OrderConfirmComponent),
        canActivate: [authGuard],
        title: 'MyShop - تأكيد الطلب'
      },
      {
        path: 'admin/products/add',
        loadComponent: () => import('./features/admin/add-product/add-product.component').then(m => m.AddProductComponent),
        canActivate: [authGuard],
        title: 'MyShop - إضافة منتج'
      },
      {
        path: 'wishes',
        loadComponent: () => import('./features/wish/wish-list/wish-list.component').then(m => m.WishListComponent),
        canActivate: [authGuard],
        title: 'MyShop - قائمة الأمنيات'
      }
    ]
  },
  // Redirect root to default language (ar)
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'ar'
  },
  // Catch all - redirect to default language
  {
    path: '**',
    redirectTo: 'ar'
  }
];
