import { Hono } from "hono";
import { getDb, type AppVariables, type Bindings } from "../env";
import { createContact, findAllContacts, findContactById, updateContact } from "../repositories/contactRepository";
import type { ContactCreateInput, ContactUpdateInput } from "../types/contact";

export const contactRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseNullableString = (value: unknown): string | null | undefined => {
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return undefined;
};

const parseRequiredString = (value: unknown): string | undefined => {
  const parsed = parseNullableString(value);
  if (parsed === undefined || parsed === null || parsed === "") {
    return undefined;
  }
  return parsed;
};

const parseContactUpdateInput = (body: unknown): ContactUpdateInput | null => {
  if (!isRecord(body)) {
    return null;
  }

  const type = parseNullableString(body.type);
  const status = parseNullableString(body.status);
  const display = parseNullableString(body.display);
  const sentence = parseNullableString(body.sentence);
  const reporter = parseNullableString(body.reporter);

  if (
    type === undefined ||
    status === undefined ||
    display === undefined ||
    sentence === undefined ||
    reporter === undefined
  ) {
    return null;
  }

  return { type, status, display, sentence, reporter };
};

const parseContactCreateInput = (body: unknown): ContactCreateInput | null => {
  if (!isRecord(body)) {
    return null;
  }

  const type = parseRequiredString(body.type);
  const status = parseRequiredString(body.status);
  const display = parseNullableString(body.display);
  const sentence = parseRequiredString(body.sentence);
  const reporter = parseRequiredString(body.reporter);

  if (type === undefined || status === undefined || display === undefined || sentence === undefined || reporter === undefined) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    type,
    status,
    display,
    sentence,
    reporter
  };
};

const parseContactId = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

contactRoutes.get("/contacts", async (c) => {
  const contacts = await findAllContacts(getDb(c.env));
  return c.json(contacts);
});

contactRoutes.get("/contacts/:id", async (c) => {
  const id = parseContactId(c.req.param("id"));
  if (!id) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Contact id is required"
        },
        requestId: c.get("requestId")
      },
      400
    );
  }

  const contact = await findContactById(getDb(c.env), id);
  if (!contact) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Contact not found"
        },
        requestId: c.get("requestId")
      },
      404
    );
  }

  return c.json(contact);
});

contactRoutes.post("/contacts", async (c) => {
  const body = await c.req.json().catch(() => null);
  const input = parseContactCreateInput(body);
  if (!input) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Invalid contact payload"
        },
        requestId: c.get("requestId")
      },
      400
    );
  }

  const created = await createContact(getDb(c.env), input);
  if (!created) {
    return c.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create contact"
        },
        requestId: c.get("requestId")
      },
      500
    );
  }

  return c.json(created, 201);
});

contactRoutes.put("/contacts/:id", async (c) => {
  const id = parseContactId(c.req.param("id"));
  if (!id) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Contact id is required"
        },
        requestId: c.get("requestId")
      },
      400
    );
  }

  const body = await c.req.json().catch(() => null);
  const input = parseContactUpdateInput(body);
  if (!input) {
    return c.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Invalid contact payload"
        },
        requestId: c.get("requestId")
      },
      400
    );
  }

  const updated = await updateContact(getDb(c.env), id, input);
  if (!updated) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Contact not found"
        },
        requestId: c.get("requestId")
      },
      404
    );
  }

  return c.json(updated);
});
