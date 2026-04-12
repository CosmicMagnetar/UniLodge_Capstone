/**
 * Contact Service - Handles contact form submissions
 * Implements: Receiving, storing, and managing contact messages
 */

import { createClient } from "@supabase/supabase-js";
import { CreateContactSchema } from "@unilodge/shared/schemas";
import type { CreateContactInput } from "@unilodge/shared/schemas";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class ContactService {
  /**
   * Create a new contact message
   */
  static async createContact(input: CreateContactInput) {
    const parsed = CreateContactSchema.parse(input);

    try {
      const { data: contact, error } = await supabase
        .from("contacts")
        .insert({
          name: parsed.name,
          email: parsed.email,
          subject: parsed.subject,
          message: parsed.message,
          status: "new",
        })
        .select()
        .single();

      if (error) throw error;

      // Send email notification to admin (implement with email service)
      await this.notifyAdmin(contact);

      return contact;
    } catch (error: any) {
      throw new Error(`Failed to create contact: ${error.message}`);
    }
  }

  /**
   * Get all contact messages (admin only)
   */
  static async getAllContacts(
    status?: string,
    page: number = 1,
    limit: number = 20
  ) {
    const offset = (page - 1) * limit;

    try {
      let query = supabase
        .from("contacts")
        .select("*", { count: "exact" });

      if (status) {
        query = query.eq("status", status);
      }

      const { data: contacts, count, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        contacts: contacts || [],
        pagination: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }
  }

  /**
   * Get a single contact message
   */
  static async getContact(contactId: string) {
    try {
      const { data: contact, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", contactId)
        .single();

      if (error) throw error;

      return contact;
    } catch (error: any) {
      throw new Error(`Failed to fetch contact: ${error.message}`);
    }
  }

  /**
   * Update contact status (new, read, responded, etc.)
   */
  static async updateContactStatus(contactId: string, status: string) {
    try {
      const validStatuses = ["new", "read", "responded", "archived"];

      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }

      const { data: contact, error } = await supabase
        .from("contacts")
        .update({ status })
        .eq("id", contactId)
        .select()
        .single();

      if (error) throw error;

      return contact;
    } catch (error: any) {
      throw new Error(`Failed to update contact status: ${error.message}`);
    }
  }

  /**
   * Add a response to a contact message
   */
  static async respondToContact(
    contactId: string,
    responseMessage: string,
    respondedBy: string
  ) {
    try {
      // Update contact status to responded
      await this.updateContactStatus(contactId, "responded");

      // Store response in contact_responses table
      const { data: response, error } = await supabase
        .from("contact_responses")
        .insert({
          contact_id: contactId,
          response_message: responseMessage,
          responded_by: respondedBy,
        })
        .select()
        .single();

      if (error) throw error;

      // Get the original contact for email notification
      const contact = await this.getContact(contactId);

      // Send response email (implement with email service)
      await this.sendResponseEmail(contact.email, contact.name, responseMessage);

      return response;
    } catch (error: any) {
      throw new Error(`Failed to respond to contact: ${error.message}`);
    }
  }

  /**
   * Delete a contact message (soft delete)
   */
  static async deleteContact(contactId: string) {
    try {
      const { error } = await supabase
        .from("contacts")
        .update({ deleted_at: new Date() })
        .eq("id", contactId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to delete contact: ${error.message}`);
    }
  }

  /**
   * Get contact statistics
   */
  static async getContactStats() {
    try {
      const { data: contacts } = await supabase
        .from("contacts")
        .select("status");

      const stats = {
        total: contacts?.length || 0,
        new: contacts?.filter((c) => c.status === "new").length || 0,
        read: contacts?.filter((c) => c.status === "read").length || 0,
        responded: contacts?.filter((c) => c.status === "responded").length || 0,
        archived: contacts?.filter((c) => c.status === "archived").length || 0,
      };

      return stats;
    } catch (error: any) {
      throw new Error(`Failed to fetch contact stats: ${error.message}`);
    }
  }

  /**
   * Notify admin of new contact message
   * (Placeholder - implement with actual email service)
   */
  private static async notifyAdmin(contact: any) {
    try {
      console.log("New contact message:", {
        from: contact.email,
        subject: contact.subject,
        timestamp: contact.created_at,
      });

      // TODO: Implement email notification
      // Example: await EmailService.sendAdminNotification(contact);

      return { success: true };
    } catch (error) {
      console.error("Failed to notify admin:", error);
      return { success: false };
    }
  }

  /**
   * Send response email to contact
   * (Placeholder - implement with actual email service)
   */
  private static async sendResponseEmail(
    email: string,
    name: string,
    message: string
  ) {
    try {
      console.log("Sending response email to:", email);

      // TODO: Implement email sending
      // Example: await EmailService.sendContactResponse(email, name, message);

      return { success: true };
    } catch (error) {
      console.error("Failed to send response email:", error);
      return { success: false };
    }
  }

  /**
   * Search contacts by email or name
   */
  static async searchContacts(searchTerm: string) {
    try {
      const { data: contacts, error } = await supabase
        .from("contacts")
        .select("*")
        .or(`email.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        .is("deleted_at", null);

      if (error) throw error;

      return contacts || [];
    } catch (error: any) {
      throw new Error(`Failed to search contacts: ${error.message}`);
    }
  }
}
