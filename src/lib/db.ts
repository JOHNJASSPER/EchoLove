import Dexie, { type Table } from 'dexie';

export interface Contact {
    id?: number;
    name: string;
    relationship: 'partner' | 'parent' | 'sibling' | 'friend' | 'colleague' | 'mentor' | 'other' | string;
    vibe: 'sweet' | 'chill' | 'deep' | 'playful';
    avatar?: string;
    phoneNumber?: string; // For SMS and WhatsApp
    email?: string; // For email
    birthday?: string; // ISO date string (YYYY-MM-DD)
    lastContacted?: Date;
    frequencyDays?: number;
    createdAt: Date;
}

export interface Interaction {
    id?: number;
    contactId: number;
    type: 'echo' | 'sms' | 'whatsapp' | 'email' | 'call' | 'meet';
    note?: string;
    date: Date;
}

export interface Draft {
    id?: number;
    contactId: number;
    content: string;
    vibe: string;
    createdAt: Date;
}

class EchoLoveDB extends Dexie {
    contacts!: Table<Contact>;
    interactions!: Table<Interaction>;
    drafts!: Table<Draft>;

    constructor() {
        super('echolove_db_v4'); // New version with phone/email
        this.version(1).stores({
            contacts: '++id, name, relationship, lastContacted, birthday, phoneNumber, email',
            interactions: '++id, contactId, date',
            drafts: '++id, contactId'
        });
    }
}

export const db = new EchoLoveDB();
