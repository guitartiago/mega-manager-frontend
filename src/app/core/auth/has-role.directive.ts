import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { TokenStorage } from './token-storage';

@Directive({ selector: '[hasRole]', standalone: true })
export class HasRoleDirective {
  private tpl = inject(TemplateRef<any>);
  private vcr = inject(ViewContainerRef);
  private token = inject(TokenStorage);

  private current: string | null = null;

  @Input() set hasRole(role: string) {
    if (this.current === role) return;
    this.current = role;
    this.vcr.clear();
    if (this.token.hasRole(role)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}

@Directive({ selector: '[hasAnyRole]', standalone: true })
export class HasAnyRoleDirective {
  private tpl = inject(TemplateRef<any>);
  private vcr = inject(ViewContainerRef);
  private token = inject(TokenStorage);

  private want: string[] = [];

  @Input() set hasAnyRole(roles: string[]) {
    this.want = roles || [];
    this.vcr.clear();
    if (this.token.hasAnyRole(this.want)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
