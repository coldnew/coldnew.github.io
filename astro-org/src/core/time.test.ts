import { describe, expect, it } from 'vitest';
import {
  formatAsOrgTimestamp,
  formatToISOString,
  type ParsedTimestamp,
  parseHugoTime,
  parseOrgTimestamp,
  parseTime,
} from './time';

describe('parseOrgTimestamp', () => {
  it('should parse basic active timestamp', () => {
    const result = parseOrgTimestamp('<2023-10-01>');
    expect(result).toEqual({
      type: 'active',
      date: new Date(2023, 9, 1), // October 1, 2023
      endDate: undefined,
      repeat: undefined,
      delay: undefined,
    });
  });

  it('should parse active timestamp with day', () => {
    const result = parseOrgTimestamp('<2023-10-01 Sun>');
    expect(result?.type).toBe('active');
    expect(result?.date).toEqual(new Date(2023, 9, 1));
  });

  it('should parse active timestamp with time', () => {
    const result = parseOrgTimestamp('<2023-10-01 Sun 14:30>');
    expect(result?.type).toBe('active');
    expect(result?.date).toEqual(new Date(2023, 9, 1, 14, 30));
  });

  it('should parse inactive timestamp', () => {
    const result = parseOrgTimestamp('[2023-10-01]');
    expect(result?.type).toBe('inactive');
    expect(result?.date).toEqual(new Date(2023, 9, 1));
  });

  it('should parse timestamp with time range', () => {
    const result = parseOrgTimestamp('<2023-10-01 Sun 14:30-16:00>');
    expect(result?.type).toBe('active');
    expect(result?.date).toEqual(new Date(2023, 9, 1, 14, 30));
    expect(result?.endDate).toEqual(new Date(2023, 9, 1, 16, 0));
  });

  it('should parse timestamp with repeat', () => {
    const result = parseOrgTimestamp('<2023-10-01 Sun +1w>');
    expect(result?.repeat).toBe('+1w');
  });

  it('should parse timestamp with delay', () => {
    const result = parseOrgTimestamp('<2023-10-01 Sun -2d>');
    expect(result?.delay).toBe('-2d');
  });

  it('should return null for invalid format', () => {
    expect(parseOrgTimestamp('2023-10-01')).toBeNull();
    expect(parseOrgTimestamp('<invalid>')).toBeNull();
    expect(parseOrgTimestamp('<2023-10-01')).toBeNull();
  });

  it('should return null for mismatched brackets', () => {
    expect(parseOrgTimestamp('<2023-10-01]')).toBeNull();
    expect(parseOrgTimestamp('[2023-10-01>')).toBeNull();
  });
});

describe('parseHugoTime', () => {
  it('should parse ISO date', () => {
    const result = parseHugoTime('2023-10-01');
    expect(result?.getTime()).toBe(new Date('2023-10-01').getTime());
  });

  it('should parse ISO datetime', () => {
    const result = parseHugoTime('2023-10-01T14:30:00Z');
    expect(result).toEqual(new Date('2023-10-01T14:30:00Z'));
  });

  it('should parse ISO with timezone', () => {
    const result = parseHugoTime('2023-10-01T14:30:00+08:00');
    expect(result).toEqual(new Date('2023-10-01T14:30:00+08:00'));
  });

  it('should return null for invalid date', () => {
    expect(parseHugoTime('invalid')).toBeNull();
    expect(parseHugoTime('2023-13-01')).toBeNull();
  });
});

describe('parseTime', () => {
  it('should parse org-mode timestamp first', () => {
    const result = parseTime('<2023-10-01 Sun 14:30>');
    expect(result?.date).toEqual(new Date(2023, 9, 1, 14, 30));
    expect(result?.type).toBe('active');
  });

  it('should fallback to Hugo format', () => {
    const result = parseTime('2023-10-01T14:30:00Z');
    expect(result?.date).toEqual(new Date('2023-10-01T14:30:00Z'));
    expect(result?.type).toBeUndefined();
  });

  it('should return null for unparseable string', () => {
    expect(parseTime('not a date')).toBeNull();
  });
});

describe('formatToISOString', () => {
  it('should format date to ISO string', () => {
    const timestamp: ParsedTimestamp = {
      date: new Date('2023-10-01T14:30:00Z'),
    };
    expect(formatToISOString(timestamp)).toBe('2023-10-01T14:30:00.000Z');
  });
});

describe('formatAsOrgTimestamp', () => {
  it('should format date only as active timestamp', () => {
    const date = new Date(2023, 9, 1); // October 1, 2023
    expect(formatAsOrgTimestamp(date)).toBe('<2023-10-01>');
  });

  it('should format date and time as active timestamp', () => {
    const date = new Date(2023, 9, 1, 14, 30); // October 1, 2023 14:30
    expect(formatAsOrgTimestamp(date)).toBe('<2023-10-01 14:30>');
  });

  it('should format as inactive timestamp', () => {
    const date = new Date(2023, 9, 1);
    expect(formatAsOrgTimestamp(date, 'inactive')).toBe('[2023-10-01]');
  });
});
