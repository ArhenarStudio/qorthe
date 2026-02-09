import { storefrontQuery } from "./client";

const CUSTOMER_CREATE = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_CREATE = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

export type CreateShopifyCustomerResult =
  | { success: true; customerId?: string }
  | { success: false; errors: string[] };

/**
 * Creates a customer in Shopify via Storefront API.
 * Requires unauthenticated_write_customers scope.
 */
export async function createShopifyCustomer(
  email: string,
  password: string,
  firstName?: string | null,
  lastName?: string | null
): Promise<CreateShopifyCustomerResult> {
  try {
    const data = await storefrontQuery<{
      customerCreate: {
        customer: { id: string; email: string; firstName?: string; lastName?: string } | null;
        customerUserErrors: Array<{ field?: string[]; message: string; code?: string }>;
      };
    }>(CUSTOMER_CREATE, {
      input: {
        email,
        password,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
      },
    });

    const payload = data.customerCreate;
    if (payload.customerUserErrors?.length) {
      return {
        success: false,
        errors: payload.customerUserErrors.map((e) => e.message),
      };
    }
    return {
      success: true,
      customerId: payload.customer?.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, errors: [message] };
  }
}

export type GetShopifyCustomerTokenResult =
  | { success: true; accessToken: string; expiresAt: string }
  | { success: false; errors: string[] };

/**
 * Creates a customer access token in Shopify (login).
 * Use this to get a token for Storefront API customer operations.
 */
export async function getShopifyCustomerToken(
  email: string,
  password: string
): Promise<GetShopifyCustomerTokenResult> {
  try {
    const data = await storefrontQuery<{
      customerAccessTokenCreate: {
        customerAccessToken: { accessToken: string; expiresAt: string } | null;
        customerUserErrors: Array<{ field?: string[]; message: string; code?: string }>;
      };
    }>(CUSTOMER_ACCESS_TOKEN_CREATE, {
      input: { email, password },
    });

    const payload = data.customerAccessTokenCreate;
    if (payload.customerUserErrors?.length) {
      return {
        success: false,
        errors: payload.customerUserErrors.map((e) => e.message),
      };
    }
    const token = payload.customerAccessToken;
    if (!token) {
      return { success: false, errors: ["No token returned"] };
    }
    return {
      success: true,
      accessToken: token.accessToken,
      expiresAt: token.expiresAt,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, errors: [message] };
  }
}
