import { describe, expect, test } from 'bun:test';
import { getAvailableSkills, getDefaultSkillCommands } from './mock-data';

describe('local skill activation', () => {
  test('draft release review is excluded until activated', () => {
    const enabled = getDefaultSkillCommands();
    expect(getAvailableSkills(enabled, 'release')).toEqual([]);
    expect(getAvailableSkills([...enabled, '/release-review'], 'release').map(skill => skill.command)).toEqual(['/release-review']);
  });
  test('disabled goal skill is excluded from slash results', () => {
    expect(getAvailableSkills(getDefaultSkillCommands(), 'goal').map(skill => skill.command)).toEqual(['/goal']);
    expect(getAvailableSkills(getDefaultSkillCommands().filter(command => command !== '/goal'), 'goal')).toEqual([]);
  });
});