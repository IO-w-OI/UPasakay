<?php

namespace App\Mail;

use App\Models\Passenger;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PassengerApproved extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Passenger $passenger
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your UPasakay account is approved',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.passenger-approved',
        );
    }
}
