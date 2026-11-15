import { describe, test } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { getAvailableSkills, type SkillCommand } from './mock-data';

describe('enabled workspace skill filtering', () => {
  const skills: SkillCommand[] = [
    { command: '/release-review', title: 'Release review', detail: 'Review a release.' },
    { command: '/goal', title: 'Goal', detail: 'Clarify a goal.' },
  ];

  test('returns matching skills only when enabled', () => {
    deepStrictEqual(getAvailableSkills(skills, [], 'release'), []);
    deepStrictEqual(getAvailableSkills(skills, ['/release-review'], 'release').map(skill => skill.command), ['/release-review']);
  });

  test('matches enabled skills by slash command or title without regard to case', () => {
    deepStrictEqual(getAvailableSkills(skills, ['/goal'], 'GOAL').map(skill => skill.command), ['/goal']);
    deepStrictEqual(getAvailableSkills(skills, ['/goal'], 'release'), []);
  });
});