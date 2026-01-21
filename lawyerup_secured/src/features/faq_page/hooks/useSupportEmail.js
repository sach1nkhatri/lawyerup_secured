import Swal from 'sweetalert2';

export const useSupportEmail = () => {
    return () => {
        const supportEmail = 'support@lawyerup.com';
        navigator.clipboard.writeText(supportEmail)
            .then(() => {
                Swal.fire({
                    title: 'Need Help?',
                    html: `<p>Email copied to clipboard:</p><a href="mailto:${supportEmail}">${supportEmail}</a>`,
                    icon: 'question',
                    customClass: {
                        icon: 'no-border'
                    },
                    confirmButtonText: 'Close',
                });
            })
            .catch(() => {
                Swal.fire({
                    title: 'Oops!',
                    text: 'Failed to copy email. Please copy it manually.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            });
    };
};
