export class RegExpList {
  private readonly patterns: string[];
  private compiledPatterns: RegExp[] | null = null;

  constructor(patterns: string[]) {
    this.patterns = patterns;
  }

  private compilePattern(pattern: string): RegExp {
    // 转义特殊正则字符，然后处理通配符
    const escaped = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\//g, '\\/');
    return new RegExp(`^${escaped}$`);
  }

  include(value: string): boolean {
    if (!this.compiledPatterns) {
      this.compiledPatterns = this.patterns.map((p) => this.compilePattern(p));
    }
    return this.compiledPatterns.some((regex) => regex.test(value));
  }
}
