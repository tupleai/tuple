import type { ParentComponent } from 'solid-js';

const AuthLayout: ParentComponent = (props) => {
  return (
    <div class="auth-layout">
      <div class="auth-card">
        <div class="auth-logo">
          <a href="https://tuple.ai" class="auth-logo__link">
            <img src="/logotype-light.png" alt="Tuple" class="auth-logo__img auth-logo__img--light" />
            <img src="/logotype-dark.png" alt="" class="auth-logo__img auth-logo__img--dark" />
          </a>
        </div>
        {props.children}
      </div>
    </div>
  );
};

export default AuthLayout;
