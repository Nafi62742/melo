import { adminRepository, ADMIN_AUTH_CHANGED_EVENT } from '../repositories/admin.repository';
import { productService } from './product.service';
import { productTypeService } from './product-type.service';
import { orderService } from './order.service';
import { storeLinkService } from './store-link.service';

export { ADMIN_AUTH_CHANGED_EVENT };

/**
 * AdminService — Domain service for admin authentication, session state,
 * database connectivity checks, and full-store synchronization.
 * Delegates all DB & storage I/O to AdminRepository and domain services.
 */
class AdminService {
  getDefaultAdminEmail(): string {
    return adminRepository.getDefaultAdminEmail();
  }

  isAuthenticated(): boolean {
    return adminRepository.isSessionAuthenticated();
  }

  setAuthenticated(authenticated: boolean): void {
    adminRepository.setSessionAuthenticated(authenticated);
  }

  async login(email: string, password: string): Promise<boolean> {
    const isValid = await adminRepository.verifyCredentialsInDb(email, password);
    if (isValid) {
      this.setAuthenticated(true);
    }
    return isValid;
  }

  logout(): void {
    this.setAuthenticated(false);
  }

  isDatabaseConfigured(): boolean {
    return adminRepository.isDatabaseConfigured();
  }

  async checkDatabaseConnection(): Promise<boolean> {
    return adminRepository.checkDatabaseConnection();
  }

  async syncAllFromDatabase() {
    const [syncedTypes, syncedProducts, syncedOrders, syncedLinks] = await Promise.all([
      productTypeService.syncFromDatabase(),
      productService.syncFromDatabase(),
      orderService.syncFromDatabase(),
      storeLinkService.syncFromDatabase(),
    ]);
    return {
      productTypes: syncedTypes,
      products: syncedProducts,
      orders: syncedOrders,
      storeLinks: syncedLinks,
    };
  }

  async pushAllToDatabase(): Promise<boolean> {
    await productTypeService.pushAllToDatabase();
    const okProducts = await productService.pushAllToDatabase();
    await storeLinkService.pushAllToDatabase();
    return okProducts;
  }
}

export const adminService = new AdminService();

